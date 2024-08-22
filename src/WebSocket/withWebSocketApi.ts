import WebSocket, { WebSocketServer } from "ws";
import { Boards } from "Routes/V1/Boards";
import { AccessToken } from "Interface";
import { verifyToken } from "Tokens";
import winston from "winston";

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const TEN_MINUTES = 10 * MINUTE;
const WS_TOKENS_CLEANUP_INTERVAL = TEN_MINUTES;
const SAVE_EVENTS_INTERVAL = 10;
const SNAPSHOT_EVENTS_TO_REQUEST = 100;
const SNAPSHOT_RETRY_TIMEOUT = 2 * MINUTE;
const SNAPSHOT_REQUEST_TIMEOUT = 10 * SECOND;

export function withWebSocketApi(wss: WebSocketServer, boards: Boards, logger: winston.Logger): void {
    const boardClients = new Map<string, WebSocket.WebSocket[]>();
    const wsTokens = new Map<WebSocket, AccessToken[]>();
    const snapshotRequestTimers = new Map<string, NodeJS.Timeout>();

    wss.on("connection", (ws) => {
        setupSocketErrorHandling(ws);
        setupSocketMessageHandling(ws);
        setupSocketCloseHandling(ws);
    });

    function setupSocketErrorHandling(ws: WebSocket) {
        ws.on("error", (err) => {
            console.error("WebSocket error:", err);
            ws.close();
        });
    }

    const msgHandlingQueue: SocketMessage[] = [];
    function setupSocketMessageHandling(ws: WebSocket) {
        ws.on("message", async (data) => {
            try {
                const msg = JSON.parse(data.toString()) as SocketMessage;
                msgHandlingQueue.push(msg);
                processMsgQueue(ws);
            } catch (error) {
                console.error("Error parsing JSON message:", error);
                sendError(ws, "Invalid JSON message format");
                ws.close();
            }
        });
    }

    let isProcessing = false;
    async function processMsgQueue(ws: WebSocket) {
        if (isProcessing) return;
        isProcessing = true;

        while (msgHandlingQueue.length > 0) {
            const msg = msgHandlingQueue.shift();
            if (msg) {
                await handleMessage(ws, msg);
            }
        }

        isProcessing = false;
    }

    async function handleMessage(ws: WebSocket, msg: SocketMessage) {
        switch (msg.type) {
            case "Auth":
                return handleAuthMsg(msg, ws);
            case "Subscribe":
                return handleSubscribeMsg(msg, ws);
            case "Unsubscribe":
                return handleUnsubscribeMsg(msg, ws);
            case "BoardEvent":
                return handleBoardEventMsg(msg, ws);
            case "BoardSnapshot":
                return handleSnapshotMsg(msg, ws);
        }
    }

    function setupSocketCloseHandling(ws: WebSocket) {
        ws.on("close", () => {
            disconnectClientFromBoards(ws);
        });
    }

    function disconnectClientFromBoards(ws: WebSocket) {
        for (const [boardId, clients] of boardClients.entries()) {
            const index = clients.indexOf(ws);
            if (index !== -1) {
                clients.splice(index, 1);
                boardClients.set(boardId, clients);
            }
        }
    }

    async function handleAuthMsg(msg: Auth, ws: WebSocket): Promise<void> {
        const token = await verifyToken(msg.jwt);
        if (token) {
            return saveToken(ws, token);
        } else {
            return sendError(ws, "Invalid or expired token");
        }
    }

    function saveToken(ws: WebSocket, token: AccessToken): void {
        const tokens = wsTokens.get(ws) || [];
        tokens.push(token);
        wsTokens.set(ws, tokens);
    }

    function sendError(
        ws: WebSocket,
        message: string,
        ...args: Array<{ [additionalInfo: string]: string }>
    ): void {
        const additionalInfo = Object.assign({}, ...args);
        return ws.send(JSON.stringify({ type: "Error", message, ...additionalInfo }));
    }

    async function handleSubscribeMsg(
        msg: Subscribe,
        ws: WebSocket
    ): Promise<void> {
        try {
            if (!(await hasSubscribeRights(ws, msg.boardId))) {
                return sendError(
                    ws,
                    "Access denied: Subscribe to board events.",
                    { denidedBoardId: msg.boardId },
                );
            }
            subscribeClientToBoard(ws, msg.boardId);
            await sendInitialDataToClient(ws, msg.boardId);
        } catch (error) {
            return sendError(ws, "Access denied: Subscribe to board events.");
        }
    }

    async function hasSubscribeRights(
        ws: WebSocket,
        boardId: string
    ): Promise<boolean> {
        return (
            (await isValidLink(boardId, ["view", "edit"])) ||
            hasAnyRightInTokens(ws, boardId, ["reads", "edits", "owns"])
        );
    }

    async function isValidLink(
        boardId: string,
        linkTypes: ("view" | "edit")[]
    ): Promise<boolean> {
        try {
            return boards.isValidLink(boardId, linkTypes);
        } catch (error) {
            return false;
        }
    }

    function hasAnyRightInTokens(
        ws: WebSocket,
        boardId: string,
        rightsTypes: ("reads" | "edits" | "owns")[]
    ): boolean {
        const tokens = wsTokens.get(ws) || [];
        const currentTime = Date.now() / 1000; // Convert to seconds
        for (const rightType of rightsTypes) {
            for (const token of tokens) {
                if (token.exp < currentTime) {
                    continue; // Ignore expired tokens
                }
                const rights = token[rightType]?.boards;
                if (rights && rights.includes(boardId)) {
                    return true; // Found a valid token with the required right
                }
            }
        }
        return false; // No valid token with the required rights
    }

    function subscribeClientToBoard(ws: WebSocket, boardId: string): void {
        const clients = boardClients.get(boardId) ?? [];
        clients.push(ws);
        boardClients.set(boardId, clients);
    }

    async function sendInitialDataToClient(ws: WebSocket, boardId: string) {
        const lastSnapshotEvent = await sendLatestSnapshot(ws, boardId);
        await sendBoardEvents(ws, boardId, lastSnapshotEvent);
    }

    async function sendLatestSnapshot(
        ws: WebSocket,
        boardId: string
    ): Promise<number> {
        const snapshot = await boards.getLatestBoardSnapshot(boardId);
        if (!snapshot) {
            return 0;
        }
        ws.send(
            JSON.stringify({
                type: "BoardSnapshot",
                boardId: boardId,
                snapshot,
            })
        );
        return snapshot.lastIndex;
    }

    async function sendBoardEvents(ws: WebSocket, boardId: string, offset = 0) {
        const events = await boards.getBoardEvents(boardId, offset);
        ws.send(
            JSON.stringify({
                type: "BoardEventList",
                boardId: boardId,
                events: events,
            })
        );
    }

    const eventsManager = new EventsManager(boards);

    async function handleBoardEventMsg(
        msg: BoardEvent,
        ws: WebSocket
    ): Promise<void> {
        const hasEditRights = await canEditBoard(ws, msg.boardId);
        if (!hasEditRights) {
            return sendError(ws, "Access denied: edit board.");
        }
        enqueueBoardEvent(msg.boardId, msg.event.body);
    }

    async function canEditBoard(
        ws: WebSocket,
        boardId: string
    ): Promise<boolean> {
        const hasDirectLinkEditPermission = await isValidLink(boardId, [
            "edit",
        ]);
        const hasTokenEditPermission = hasAnyRightInTokens(ws, boardId, [
            "edits",
            "owns",
        ]);
        return hasDirectLinkEditPermission || hasTokenEditPermission;
    }

    function enqueueBoardEvent(
        boardId: string,
        eventBody: BoardEventBody
    ): void {
        eventsManager.enqueueEvent(boardId, eventBody);
    }

    function handleUnsubscribeMsg(msg: Unsubscribe, ws: WebSocket): void {
        const clients = boardClients.get(msg.boardId) ?? [];
        const index = clients.indexOf(ws);
        if (index !== -1) {
            clients.splice(index, 1);
        }
        boardClients.set(msg.boardId, clients);
    }

    boards.onEventSave = sendMessageToClients;

    function sendMessageToClients(
        boardId: string,
        message: SocketMessage
    ): void {
        const clients = boardClients.get(boardId) ?? [];
        const content = JSON.stringify(message);
        for (const client of clients) {
            client.send(content);
        }
    }

    function requestSnapshotFromClient(
        boardId: string,
        sinceLast: number
    ): void {
        if (snapshotRequestTimers.has(boardId)) {
            return;
        }
        const clients = boardClients.get(boardId);
        if (clients && clients.length > 0) {
            const randomIndex = Math.floor(Math.random() * clients.length);
            const randomClient = clients[randomIndex];
            if (randomClient) {
                sendSnapshotRequest(randomClient, boardId, sinceLast);
                setupSnapshotRequestTimeout(boardId, randomClient, sinceLast);
            }
        }
    }

    eventsManager.requestSnapshotCallback = requestSnapshotFromClient;

    function sendSnapshotRequest(
        ws: WebSocket,
        boardId: string,
        sinceLast: number
    ) {
        const message = JSON.stringify({
            type: "CreateSnapshotRequest",
            boardId: boardId,
            sinceLast,
        });
        ws.send(message);
    }

    function setupSnapshotRequestTimeout(
        boardId: string,
        client: WebSocket,
        sinceLast: number
    ): void {
        clearTimeout(snapshotRequestTimers.get(boardId));
        const timer = setTimeout(() => {
            requestSnapshotFromClient(boardId, sinceLast);
        }, SNAPSHOT_RETRY_TIMEOUT);
        snapshotRequestTimers.set(boardId, timer);
    }

    async function handleSnapshotMsg(snapshotMsg: any, ws: WebSocket) {
        try {
            const { boardId, snapshot } = snapshotMsg;
            await boards.saveBoardSnapshot(boardId, snapshot);
            clearTimeout(snapshotRequestTimers.get(boardId));
            snapshotRequestTimers.delete(boardId);
        } catch (error) {
            console.error(`Failed to process snapshot: ${error}`);
        }
    }

    setInterval(() => {
        for (const [ws, tokens] of wsTokens.entries()) {
            const currentTime = Date.now() * 0.001;
            let validTokens = [];
            for (const token of tokens) {
                if (token.exp > currentTime) {
                    validTokens.push(token);
                }
            }
            wsTokens.set(ws, validTokens);
        }
    }, WS_TOKENS_CLEANUP_INTERVAL);
}

interface Auth {
    type: "Auth";
    jwt: string;
}

interface BoardEvent {
    type: "BoardEvent";
    boardId: string;
    event: any;
}

interface BoardEventList {
    type: "BoardEventList";
    boardId: string;
    events: any[];
}

interface Subscribe {
    type: "Subscribe";
    boardId: string;
    index: number;
}

interface Unsubscribe {
    type: "Unsubscribe";
    boardId: string;
}

interface Error {
    type: "Error";
    message: string;
}

interface SnapshotRequest {
    type: "CreateSnapshotRequest";
    boardId: string;
}

interface SnapshotResponse {
    type: "BoardSnapshot";
    boardId: string;
    snapshot: any; // This could be strongly typed
    lastEventOrder: number;
}

export type SocketMessage =
    | Auth
    | BoardEvent
    | BoardEventList
    | Subscribe
    | Unsubscribe
    | Error
    | SnapshotRequest
    | SnapshotResponse;

type BoardEventBody = any;

export class EventsManager {
    readonly processing: string[] = [];

    private queues: {
        [boardId: string]: {
            boardId: string;
            events: BoardEventBody[];
        };
    } = {};

    constructor(private boards: Boards) {
        setInterval(() => {
            this.tryToSaveEvents();
        }, SAVE_EVENTS_INTERVAL);
    }

    tryToSaveEvents = (): void => {
        for (const eventsQueue of Object.values(this.queues)) {
            const boardId = eventsQueue.boardId;
            if (this.isBoardReady(boardId)) {
                delete this.queues[boardId];
                this.saveEvents(boardId, eventsQueue.events);
            }
        }
    };

    async saveEvents(
        boardId: string,
        eventBodyQueue: BoardEventBody[]
    ): Promise<void> {
        try {
            this.processing.push(boardId);
            let eventBody: BoardEventBody | undefined;
            while (
                eventBodyQueue.length > 0 &&
                (eventBody = eventBodyQueue.shift())
            ) {
                const boardEvent = await this.boards.addEventToBoard(
                    boardId,
                    eventBody.eventId,
                    eventBody
                );
                this.requestSnapshotIfNeeded(boardId);
            }
            const index = this.processing.indexOf(boardId);
            if (index > -1) {
                this.processing.splice(index, 1);
            }
        } catch (error) {}
    }

    private snapshotTimers: Map<string, NodeJS.Timeout> = new Map<
        string,
        NodeJS.Timeout
    >();

    async requestSnapshotIfNeeded(boardId: string): Promise<void> {
        try {
            const count = await this.boards.getEventCountSinceLastSnapshot(
                boardId
            );
            if (count >= SNAPSHOT_EVENTS_TO_REQUEST) {
                if (this.snapshotTimers.has(boardId)) {
                    clearTimeout(this.snapshotTimers.get(boardId)!);
                }

                const timer = setTimeout(() => {
                    this.requestSnapshotCallback(boardId, count);
                    this.snapshotTimers.delete(boardId);
                }, SNAPSHOT_REQUEST_TIMEOUT);

                this.snapshotTimers.set(boardId, timer);
            }
        } catch (error) {
            console.error(
                `Failed to request snapshot for board ${boardId}: ${error}`
            );
        }
    }

    requestSnapshotCallback(boardId: string, sinceLast: number): void {}

    isBoardReady(boardId: string): boolean {
        return !this.processing.includes(boardId);
    }

    enqueueEvent(boardId: string, eventBody: BoardEventBody): void {
        const queue = this.queues[boardId] || { boardId, events: [] };
        queue.events.push(eventBody);
        this.queues[boardId] = queue;
    }
}
