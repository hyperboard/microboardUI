import WebSocket, { WebSocketServer } from "ws";
import { Boards } from "Routes/V1/Boards";
import jwt from "jsonwebtoken";
import { AccessToken } from "Interface";
import { verifyToken } from "Tokens";

export function withWebSocketApi(wss: WebSocketServer, boards: Boards): void {
    const boardClients = new Map<string, WebSocket.WebSocket[]>();
    const wsTokens = new Map<WebSocket, AccessToken[]>();

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

    function setupSocketMessageHandling(ws: WebSocket) {
        ws.on("message", async (data) => {
            try {
                const msg = JSON.parse(data.toString()) as SocketMessage;
                await handleMessage(ws, msg);
            } catch (error) {
                console.error("Error parsing JSON message:", error);
                sendError(ws, "Invalid JSON message format");
                ws.close();
            }
        });
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

    function sendError(ws: WebSocket, message: string): void {
        return ws.send(JSON.stringify({ type: "Error", message }));
    }

    async function handleSubscribeMsg(
        msg: Subscribe,
        ws: WebSocket
    ): Promise<void> {
        try {
            if (!(await hasSubscribeRights(ws, msg.boardId))) {
                return sendError(
                    ws,
                    "Access denied: Subscribe to board events."
                );
            }
            subscribeClientToBoard(ws, msg.boardId);
            await sendBoardEvents(ws, msg.boardId);
        } catch (error) {
            return sendError(ws, "Access denied: Subscribe to board events.");
        }
    }

    async function hasSubscribeRights(
        ws: WebSocket,
        boardId: string
    ): Promise<boolean> {
        return (
            (await isValidLink(boardId, ["read", "edit"])) ||
            hasAnyRightInTokens(ws, boardId, ["reads", "edits", "owns"])
        );
    }

    async function isValidLink(
        boardId: string,
        linkTypes: ("read" | "edit")[]
    ): Promise<boolean> {
        return boards.isValidLink(boardId, linkTypes);
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

    async function sendBoardEvents(ws: WebSocket, boardId: string) {
        const events = await boards.getBoardEvents(boardId);
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
    }, 600000); // Clean up every 10 minutes
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

export type SocketMessage =
    | Auth
    | BoardEvent
    | BoardEventList
    | Subscribe
    | Unsubscribe
    | Error;

type BoardEventBody = unknown;

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
        }, 10);
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
        }
        const index = this.processing.indexOf(boardId);
        if (index > -1) {
            this.processing.splice(index, 1);
        }
    }

    isBoardReady(boardId: string): boolean {
        return !this.processing.includes(boardId);
    }

    enqueueEvent(boardId: string, eventBody: BoardEventBody): void {
        const queue = this.queues[boardId];
        if (queue) {
            queue.events.push(eventBody);
        } else {
            this.queues[boardId] = { boardId, events: [eventBody] };
        }
    }
}
