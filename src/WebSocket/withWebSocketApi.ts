import { AccessToken } from "Interface";
import { boardEventTotalLatency, websocketEventQueueSize } from "Metrics/metrics";
import { BoardEventData, Boards } from "Routes/V1/Boards";
import { verifyToken } from "Tokens";
import winston from "winston";
import WebSocket, { WebSocketServer } from "ws";

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const TEN_MINUTES = 10 * MINUTE;
const WS_TOKENS_CLEANUP_INTERVAL = TEN_MINUTES;
const SAVE_EVENTS_INTERVAL = 1000;
const SNAPSHOT_EVENTS_TO_REQUEST = 100;
const SNAPSHOT_RETRY_TIMEOUT = 2 * MINUTE;
const SNAPSHOT_REQUEST_TIMEOUT = 10 * SECOND;

export function withWebSocketApi(wss: WebSocketServer, boards: Boards, logger: winston.Logger): void {
    const boardClients = new Map<string, WebSocket.WebSocket[]>();
    const boardIdToLinks = new Map<string, string[]>();
    const linkToBoardId = new Map<string, string>();
    const wsTokens = new Map<WebSocket, AccessToken[]>();
    const snapshotRequestTimers = new Map<string, NodeJS.Timeout>();

    wss.on("connection", (ws) => {
        setupSocketErrorHandling(ws);
        setupSocketMessageHandling(ws);
        setupSocketCloseHandling(ws);
    });

    function setupSocketErrorHandling(ws: WebSocket) {
        ws.on("error", (err) => {
            logger.error("WebSocket error:", err);
            ws.close();
        });
    }

    const msgHandlingQueue: SocketMsg[] = [];
    let isProcessing = false;
    function setupSocketMessageHandling(ws: WebSocket) {
        ws.on("message", async (data) => {
            try {
                const msg = JSON.parse(data.toString()) as SocketMsg;
                msgHandlingQueue.push(msg);
                websocketEventQueueSize.set(msgHandlingQueue.length);
                processMsgQueue(ws);
            } catch (error) {
                logger.error("Error parsing JSON message:", error);
                sendError(ws, "Invalid JSON message format");
                ws.close();
                isProcessing = false;
            }
        });
    }

    async function processMsgQueue(ws: WebSocket) {
        if (isProcessing) return;
        isProcessing = true;

        while (msgHandlingQueue.length > 0) {
            const msg = msgHandlingQueue.shift();
            if (msg) {
                await handleMessage(ws, msg);
            }
            websocketEventQueueSize.set(msgHandlingQueue.length);
        }

        isProcessing = false;
    }

    async function handleMessage(ws: WebSocket, msg: SocketMsg) {
        switch (msg.type) {
            case "Auth":
                return await handleAuthMsg(msg, ws);
            case "Subscribe":
                return await handleSubscribeMsg(msg, ws);
            case "Unsubscribe":
                return await handleUnsubscribeMsg(msg, ws);
            case "BoardEvent":
                return await handleBoardEventMsg(msg, ws);
            case "BoardSnapshot":
                return await handleSnapshotMsg(msg, ws);
            case "ping":
                return await handlePingMsg(msg, ws);
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

    async function handleAuthMsg(msg: AuthMsg, ws: WebSocket): Promise<void> {
        const token = await verifyToken(msg.jwt, "access");
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

    function sendError(ws: WebSocket, message: string, ...args: Array<{ [additionalInfo: string]: string }>): void {
        const additionalInfo = Object.assign({}, ...args);
        return ws.send(JSON.stringify({ type: "Error", message, ...additionalInfo }));
    }

    function handlePingMsg(_msg: PingMsg, ws: WebSocket): void {
        ws.send(
            JSON.stringify({
                type: "ping",
            })
        );
    }

    const clientBoardSequences = new Map<WebSocket, Map<string, number>>();

    async function handleSubscribeMsg(msg: SubscribeMsg, ws: WebSocket): Promise<void> {
        try {
            const details = await boards.getLinkDetails(msg.boardId);
            const isPublic = await boards.isBoardPublic(msg.boardId);

            if (
                details?.type === "view" ||
                details?.type === "edit" ||
                (await hasSubscribeRights(ws, msg.boardId)) ||
                isPublic
            ) {
                await subscribeClientToBoard(ws, msg.boardId);

                confirmSubscriptionWithSeqNum(ws, msg);

                if (details?.type === "view") {
                    enforceViewMode(ws, msg.boardId);
                }

                await sendInitialDataToClient(ws, msg.boardId, msg.index);
            } else {
                sendError(ws, "Access denied: Subscribe to board events.", { denidedBoardId: msg.boardId });
            }
        } catch (error) {
            logger.error("Failed to subscribe to board events:", error);
            return sendError(ws, "Failed to subscribe to board events.");
        }
    }

    function confirmSubscriptionWithSeqNum(ws: WebSocket, msg: SubscribeMsg) {
        // Генерируем начальный порядковый номер для этой подписки
        const initialSequenceNumber = 1;
        if (!clientBoardSequences.has(ws)) {
            clientBoardSequences.set(ws, new Map());
        }
        clientBoardSequences.get(ws)!.set(msg.boardId, initialSequenceNumber);

        // Отправляем подтверждение подписки с начальным порядковым номером
        ws.send(
            JSON.stringify({
                type: "SubscribeConfirmation",
                boardId: msg.boardId,
                initialSequenceNumber: initialSequenceNumber,
            })
        );
    }

    async function hasSubscribeRights(ws: WebSocket, boardId: string): Promise<boolean> {
        return hasAnyRightInTokens(ws, boardId, ["reads", "edits", "owns"]);
    }

    async function isValidLink(boardId: string, linkTypes: ("view" | "edit")[]): Promise<boolean> {
        try {
            return boards.isValidLink(boardId, linkTypes);
        } catch (error) {
            return false;
        }
    }

    function hasAnyRightInTokens(ws: WebSocket, boardId: string, rightsTypes: ("reads" | "edits" | "owns")[]): boolean {
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

    async function subscribeClientToBoard(ws: WebSocket, boardId: string): Promise<void> {
        const board = await boards.getBoardByLink(boardId);
        if (board) {
            const mapped = boardIdToLinks.get(board.boardId) ?? [];
            if (!mapped.includes(boardId)) {
                mapped.push(boardId);
            }
            boardIdToLinks.set(board.boardId, mapped);

            linkToBoardId.set(boardId, board.boardId);
        } else {
            const mappedIds = boardIdToLinks.get(boardId);
            if (!mappedIds) {
                boardIdToLinks.set(boardId, []);
            }
        }

        const clients = boardClients.get(boardId) ?? [];
        clients.push(ws);
        boardClients.set(boardId, clients);
    }

    function enforceViewMode(ws: WebSocket, boardId: string) {
        ws.send(
            JSON.stringify({
                type: "ViewMode",
                boardId: boardId,
            })
        );
    }

    async function sendInitialDataToClient(ws: WebSocket, boardId: string, startIndex: number) {
        if (!startIndex) {
            const lastSnapshotEvent = await sendLatestSnapshot(ws, boardId);
            await sendBoardEvents(ws, boardId, lastSnapshotEvent);
        } else {
            await sendBoardEvents(ws, boardId, startIndex);
        }
    }

    async function sendLatestSnapshot(ws: WebSocket, boardId: string): Promise<number> {
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
        const savedEvents = await boards.getBoardEvents(boardId, offset);
        const enqueuedEvents = await eventsManager.getEnqueuedEvents(boardId);
        ws.send(
            JSON.stringify({
                type: "BoardEventList",
                boardId: boardId,
                events: savedEvents.concat(enqueuedEvents),
            })
        );
    }

    const eventsManager = new EventsManager(boards, logger);

    // TODO: delete commented
    // eventsManager.initialize(); skip unnecessary initialization

    async function handleBoardEventMsg(msg: BoardEventMsg, ws: WebSocket): Promise<void> {
        const expectedSequence = clientBoardSequences.get(ws)?.get(msg.boardId) || 1;

        if (msg.sequenceNumber !== expectedSequence) {
            sendError(
                ws,
                "Unexpected sequence number" +
                    JSON.stringify({
                        expectedSequence,
                        receivedSequence: msg.sequenceNumber,
                        boardId: msg.boardId,
                    })
            );
            return;
        }
        const startTime = process.hrtime.bigint();

        try {
            const canEdit = await canEditBoard(ws, msg.boardId);
            if (!canEdit) {
                return sendError(ws, "Access denied: edit board.");
            }

            const eventData = await eventsManager.processEvent(msg.boardId, msg.event.body, {
                startTime: startTime,
                queueTime: process.hrtime.bigint(),
            });

            broadcastBoardEvent(msg.boardId, {
                type: msg.type,
                boardId: msg.boardId,
                event: { body: eventData, order: eventData.order },
                sequenceNumber: msg.sequenceNumber,
                messageId: msg.messageId,
            });

            clientBoardSequences.get(ws)!.set(msg.boardId, expectedSequence + 1);

            ws.send(
                JSON.stringify({
                    type: "Confirmation",
                    messageId: msg.messageId,
                    boardId: msg.boardId,
                    sequenceNumber: msg.sequenceNumber,
                    order: eventData.order,
                })
            );

            const totalEndTime = process.hrtime.bigint();
            const totalLatency = Number(totalEndTime - startTime);
            boardEventTotalLatency.observe(totalLatency);
        } catch (error) {
            return sendError(ws, "Failed to process board event." + JSON.stringify(error));
        }
    }

    async function canEditBoard(ws: WebSocket, boardId: string): Promise<boolean> {
        const hasDirectLinkEditPermission = await isValidLink(boardId, ["edit"]);
        const isPublic = await boards.isBoardPublic(boardId);
        const hasTokenEditPermission = hasAnyRightInTokens(ws, boardId, ["edits", "owns"]);
        return hasDirectLinkEditPermission || hasTokenEditPermission || isPublic;
    }

    function handleUnsubscribeMsg(msg: UnsubscribeMsg, ws: WebSocket): void {
        const clients = boardClients.get(msg.boardId) ?? [];
        const index = clients.indexOf(ws);
        if (index !== -1) {
            clients.splice(index, 1);
        }
        boardClients.set(msg.boardId, clients);
    }

    function sendMessageToClients(message: SocketMsg, clients: WebSocket.WebSocket[]): void {
        const content = JSON.stringify(message);
        for (const client of clients) {
            client.send(content);
        }
    }

    function broadcastBoardEvent(boardOrLinkId: string, message: BoardEventMsg | BoardEventListMsg): void {
        const linksById = boardIdToLinks.get(boardOrLinkId);
        if (linksById) {
            const clients = boardClients.get(boardOrLinkId) ?? [];
            linksById.forEach((link) => {
                const linkMessage = { ...message };
                linkMessage.boardId = link;
                const linkClients = boardClients.get(link) ?? [];
                sendMessageToClients(linkMessage, linkClients);
            });
        } else {
            const actualId = linkToBoardId.get(boardOrLinkId);
            if (!actualId) {
                throw new Error("Didnt find boardId by link");
            }
            const actualIdMsg = { ...message };
            actualIdMsg.boardId = actualId;
            broadcastBoardEvent(actualId, actualIdMsg);
        }
    }

    function requestSnapshotFromClient(boardId: string, sinceLast: number): void {
        const clients = boardClients.get(boardId);
        if (clients && clients.length > 0) {
            const randomIndex = Math.floor(Math.random() * clients.length);
            const randomClient = clients[randomIndex];
            if (randomClient) {
                sendSnapshotRequest(randomClient, boardId, sinceLast);
            }
        }
    }

    eventsManager.requestSnapshotCallback = requestSnapshotFromClient;

    function sendSnapshotRequest(ws: WebSocket, boardId: string, sinceLast: number) {
        const message = JSON.stringify({
            type: "CreateSnapshotRequest",
            boardId: boardId,
            sinceLast,
        });
        ws.send(message);
    }

    function setupSnapshotRequestTimeout(boardId: string, client: WebSocket, sinceLast: number): void {
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
            eventsManager.updateSnapshotInfo(boardId, snapshot.lastIndex);
        } catch (error) {
            logger.error(`Failed to process snapshot: ${error}`);
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

export interface AuthMsg {
    type: "Auth";
    jwt: string;
}

export interface BoardEventMsg {
    type: "BoardEvent";
    boardId: string;
    event: any;
    messageId: string;
    sequenceNumber: number;
}

export interface ConfirmationMsg {
    type: "Confirmation";
    messageId: string;
    boardId: string;
    sequenceNumber: number;
    order: number;
}

export interface BoardEventListMsg {
    type: "BoardEventList";
    boardId: string;
    events: any[];
}

export interface SubscribeMsg {
    type: "Subscribe";
    boardId: string;
    index: number;
}

export interface SubscribeConfirmationMsg {
    type: "SubscribeConfirmation";
    boardId: string;
    initialSequenceNumber: number;
}

export interface UnsubscribeMsg {
    type: "Unsubscribe";
    boardId: string;
}

export interface ErrorMsg {
    type: "Error";
    message: string;
    deniedBoardId?: string;
    expectedSequence?: number;
    receivedSequence?: number;
}

export interface SnapshotRequestMsg {
    type: "CreateSnapshotRequest";
    boardId: string;
}

export interface SnapshotResponseMsg {
    type: "BoardSnapshot";
    boardId: string;
    snapshot: any;
    lastEventOrder: number;
}

export interface ViewModeMsg {
    type: "ViewMode";
    boardId: string;
}

export interface PingMsg {
    type: "ping";
}

export type EventsMsg =
    | ViewModeMsg
    | BoardEventMsg
    | BoardEventListMsg
    | SnapshotRequestMsg
    | SnapshotResponseMsg
    | SubscribeConfirmationMsg;

export type SocketMsg =
    | EventsMsg
    | AuthMsg
    | SubscribeMsg
    | UnsubscribeMsg
    | ErrorMsg
    | ViewModeMsg
    | ConfirmationMsg
    | PingMsg;

type BoardEventBody = any;

export interface EventMetadata {
    startTime: bigint;
    queueTime: bigint;
}

export class EventsManager {
    readonly processing: string[] = [];

    private lastEventOrders: Map<string, number> = new Map();
    private boardUuidMap: Map<string, string> = new Map();
    private eventCountSinceLastSnapshot: Map<string, number> = new Map();
    private snapshotRequestTimers: Map<string, NodeJS.Timeout> = new Map();

    private queues: {
        [boardId: string]: {
            boardId: string;
            events: BoardEventBody[];
            isSaving: boolean;
        };
    } = {};

    constructor(private boards: Boards, private logger: winston.Logger) {
        setInterval(() => {
            this.tryToSaveEvents();
        }, SAVE_EVENTS_INTERVAL);
    }

    // TODO: delete unused initialize function
    async initialize() {
        try {
            const boardLastOrders = await this.boards.getAllBoardLastEventOrders();
            for (const { board_uuid, edit_link_uuids, last_order } of boardLastOrders) {
                this.lastEventOrders.set(board_uuid, last_order);
                this.boardUuidMap.set(board_uuid, board_uuid);
                this.eventCountSinceLastSnapshot.set(board_uuid, 0);

                for (const edit_link_uuid of edit_link_uuids) {
                    if (edit_link_uuid) {
                        this.boardUuidMap.set(edit_link_uuid, board_uuid);
                    }
                }

                const eventCount = await this.boards.getEventCountSinceLastSnapshot(board_uuid);
                this.eventCountSinceLastSnapshot.set(board_uuid, eventCount);
            }
        } catch (error) {
            this.logger.error("Failed to initialize event orders:", error);
        }
    }

    async processEvent(boardId: string, eventBody: BoardEventBody, metadata: EventMetadata): Promise<BoardEventData> {
        const boardUuid = await this.getBoardUuid(boardId);
        const newOrder = await this.incrementLastEventOrder(boardUuid);

        const data = this.enqueueEventForSaving(boardUuid, eventBody, metadata, newOrder);

        const eventCount = await this.incrementEventCountSinceSnapshot(boardUuid);

        if (eventCount >= SNAPSHOT_EVENTS_TO_REQUEST) {
            this.requestSnapshotIfNotAlreadyRequested(boardId);
        }

        return data;
    }

    async getBoardUuid(boardId: string): Promise<string> {
        let boardUuid = this.boardUuidMap.get(boardId);
        if (!boardUuid) {
            const details = await this.boards.getBoardDetails(boardId);
            if (!details) {
                throw new Error(`Error processing event: board ${boardId} not found`);
            }
            boardUuid = details.uniq_id;
            this.boardUuidMap.set(boardId, boardUuid);
        }
        return boardUuid;
    }

    async incrementLastEventOrder(boardUuid: string): Promise<number> {
        const oldOrder = await this.getLastEventOrder(boardUuid);
        const newOrder = oldOrder + 1;
        this.lastEventOrders.set(boardUuid, newOrder);
        return newOrder;
    }

    async getLastEventOrder(boardUuid: string): Promise<number> {
        let order = this.lastEventOrders.get(boardUuid);
        if (!order) {
            order = await this.boards.getLastEventOrderForBoard(boardUuid);
            if (!isNaturalNumber(order)) {
                throw new Error(`Error processing event: board ${boardUuid} not found`);
            }
            this.lastEventOrders.set(boardUuid, order);
        }
        return order;
    }

    enqueueEventForSaving(
        boardUuid: string,
        eventBody: BoardEventBody,
        metadata: EventMetadata,
        newOrder: number
    ): BoardEventData {
        const queue = this.queues[boardUuid] || {
            boardId: boardUuid,
            events: [],
        };
        const data = { ...eventBody, order: newOrder };
        queue.events.push({
            data,
            metadata,
        });
        this.queues[boardUuid] = queue;
        return data;
    }

    async incrementEventCountSinceSnapshot(boardUuid: string): Promise<number> {
        const currentCount = await this.getEventCountSinceLastSnapshot(boardUuid);
        const newCount = currentCount + 1;
        this.eventCountSinceLastSnapshot.set(boardUuid, newCount);
        return newCount;
    }

    async getEventCountSinceLastSnapshot(boardUuid: string): Promise<number> {
        let eventCount = this.eventCountSinceLastSnapshot.get(boardUuid);
        if (!eventCount) {
            eventCount = await this.boards.getEventCountSinceLastSnapshot(boardUuid);
            if (!isNaturalNumber(eventCount)) {
                throw new Error(`Error processing event: board ${boardUuid} not found`);
            }
            this.eventCountSinceLastSnapshot.set(boardUuid, eventCount);
        }
        return eventCount;
    }

    // TODO use boardUuid
    // here boardId is either boardUuid or one of edit links
    private requestSnapshotIfNotAlreadyRequested(boardId: string): void {
        if (this.snapshotRequestTimers.has(boardId)) {
            clearTimeout(this.snapshotRequestTimers.get(boardId));
            this.snapshotRequestTimers.delete(boardId);
        }

        const initialTimer = setTimeout(() => {
            this.executeSnapshotRequest(boardId);
        }, SNAPSHOT_REQUEST_TIMEOUT);

        this.snapshotRequestTimers.set(boardId, initialTimer);
    }

    private executeSnapshotRequest(boardId: string): void {
        const eventCount = this.eventCountSinceLastSnapshot.get(boardId) || 0;

        this.requestSnapshotCallback(boardId, eventCount);

        const retryTimer = setTimeout(() => {
            this.executeSnapshotRequest(boardId); // Retry the request
        }, SNAPSHOT_RETRY_TIMEOUT);

        this.snapshotRequestTimers.set(boardId, retryTimer);
    }

    // In updateSnapshotInfo method:
    updateSnapshotInfo(boardId: string, lastEventOrder: number) {
        const actualBoardUuid = this.boardUuidMap.get(boardId) || boardId;
        this.eventCountSinceLastSnapshot.set(actualBoardUuid, 0);
        this.lastEventOrders.set(actualBoardUuid, lastEventOrder);

        // Clear any existing timers when snapshot is received
        if (this.snapshotRequestTimers.has(actualBoardUuid)) {
            clearTimeout(this.snapshotRequestTimers.get(actualBoardUuid));
            this.snapshotRequestTimers.delete(actualBoardUuid);
        }
    }

    async tryToSaveEvents() {
        for (const [boardId, queue] of Object.entries(this.queues)) {
            if (queue.events.length > 0 && !queue.isSaving) {
                queue.isSaving = true;
                try {
                    const eventsToSave = [...queue.events];
                    const before = eventsToSave.length;

                    await this.saveEvents(boardId, eventsToSave);
                    // New events could have been enqueued after saving
                    queue.events.splice(0, before);
                } catch (error) {
                    this.logger.error(`Failed to save events for board ${boardId}:`, error);
                } finally {
                    queue.isSaving = false;
                }
            }
        }
    }

    private async saveEvents(
        boardId: string,
        eventQueue: Array<{
            data: BoardEventData;
            metadata: EventMetadata;
        }>
    ) {
        const events = eventQueue.map((event) => event.data);

        try {
            await this.boards.addEventsToBoard(boardId, events);
        } catch (error) {
            throw error;
        }

        /*
        eventQueue.forEach((event, index) => {
            const { metadata } = event;
            const totalEndTime = process.hrtime.bigint();
            const totalLatency = Number(totalEndTime - metadata.startTime);
            boardEventTotalLatency.observe(totalLatency);
            console.log(`[DEBUG] Event ${index} total latency: ${totalLatency}`);
        });
        */
    }

    async getEnqueuedEvents(boardId: string): Promise<any[]> {
        const boardUuid = await this.getBoardUuid(boardId);
        const queue = this.queues[boardUuid];
        let events = [];
        if (queue) {
            events = queue.events;
        }
        return events;
    }

    requestSnapshotCallback(boardId: string, sinceLast: number): void {}

    isBoardReady(boardId: string): boolean {
        return !this.processing.includes(boardId);
    }
}

function isNaturalNumber(order: number): boolean {
    return typeof order === "number" && order >= 0 && Number.isInteger(order);
}
