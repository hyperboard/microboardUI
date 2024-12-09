import { AccessKeyType } from "drizzle/entities/boardAccessKeys";
import { DirectAccessType } from "drizzle/entities/boards";
import { AccessToken } from "Interface";
import { boardEventTotalLatency, websocketEventQueueSize } from "Metrics/metrics";
import { Redis, REDIS_HASH } from "Redis";
import { BoardEventData, Boards } from "Routes/V1/Boards";
import type { AccessKeysService } from "Routes/V2/Boards/access-keys.service";
import type { BoardsService } from "Routes/V2/Boards/boards.service";
import { verifyToken } from "Tokens";
import winston from "winston";
import WebSocket, { WebSocketServer } from "ws";
import { Presence } from "./Presence";

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const TEN_MINUTES = 10 * MINUTE;
const WS_TOKENS_CLEANUP_INTERVAL = TEN_MINUTES;
const SAVE_EVENTS_INTERVAL = 1000;
const SNAPSHOT_EVENTS_TO_REQUEST = 100;
const SNAPSHOT_RETRY_TIMEOUT = 2 * MINUTE;
const SNAPSHOT_REQUEST_TIMEOUT = 10 * SECOND;

export function withWebSocketApi({
    wss,
    boards,
    accessKeysService,
    logger,
    redis,
    boardsService,
}: {
    wss: WebSocketServer;
    boards: Boards;
    accessKeysService: AccessKeysService;
    logger: winston.Logger;
    redis: Redis;
    boardsService: BoardsService;
}): void {
    const boardClients = new Map<string, WebSocket.WebSocket[]>();
    const wsTokens = new Map<WebSocket, AccessToken>();
    const wsAccessKeys = new Map<WebSocket, string>();
    const snapshotRequestTimers = new Map<string, NodeJS.Timeout>();
    const presence = new Presence(redis);

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

    async function invalidateBoardRights(boardUUID: string, byUser = false) {
        broadcastBoardEvent(boardUUID, {
            type: "InvalidateRights",
            boardId: boardUUID,
            byUser
        })
    }
    boardsService.setInvalidateBoardRights(invalidateBoardRights);

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
            case "PresenceEvent":
                return await handlePresenceEventMsg(msg, ws);
            case "BoardSnapshot":
                return await handleSnapshotMsg(msg, ws);
            case "GetMode":
                return await handleGetModeMsg(msg, ws);
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
        wsTokens.set(ws, token);
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

    async function handleGetModeMsg(msg: GetModeMsg, ws: WebSocket) {
        const mode = await getMode(ws, msg.boardId);
            if (mode) {
                enforceMode(ws, msg.boardId, mode);
            }
            if (!mode) {
                return sendError(ws, "Access denied: edit board.");
            }
    }

    const socketsBoardsSeqNums = new Map<WebSocket, Map<string, number>>();

    async function handleSubscribeMsg(msg: SubscribeMsg, ws: WebSocket): Promise<void> {
        try {
            if (msg.accessKey) {
                wsAccessKeys.set(ws, msg.accessKey);
            }
            const boardId = msg.boardId;
            const mode = await getMode(ws, msg.boardId);

            if (mode) {
                await subscribeClientToBoard(ws, boardId);

                const initialSequenceNumber = getInitialSeqNum(ws, boardId);
                const snapshot = await boards.getLatestBoardSnapshot(boardId);
                const lastSnapshotEventOrder = snapshot?.lastIndex || 0;
                const eventsSinceLastSnapshot = await getEventsSinceLastSnapshot(boardId, lastSnapshotEventOrder);
                ws.send(
                    JSON.stringify({
                        type: "BoardSubscriptionCompleted",
                        boardId,
                        mode,
                        snapshot,
                        lastSnapshotEventOrder,
                        eventsSinceLastSnapshot,
                        initialSequenceNumber,
                    })
                );
                // const presenceEvents = await presence.getBoardEvents(boardId);
                const presenceSnapshots = await presence.createBoardPresenceSnapshots(boardId);
                ws.send(
                    JSON.stringify({
                        type: "UserJoin",
                        boardId: boardId,
                        userId: msg.userId,
                        // events: presenceEvents,
                        snapshots: presenceSnapshots,
                        timestamp: Date.now(),
                    })
                );
            } else {
                sendError(ws, "Access denied: Subscribe to board events.", { denidedBoardId: msg.boardId });
            }
        } catch (error) {
            logger.error("Failed to subscribe to board events:", error);
            return sendError(ws, "Failed to subscribe to board events.");
        }
    }

    function getInitialSeqNum(ws: WebSocket, boardId: string): number {
        const initialSequenceNumber = 1;
        let socketBoardsSeqNums = socketsBoardsSeqNums.get(ws);
        if (!socketBoardsSeqNums) {
            socketBoardsSeqNums = new Map();
            socketsBoardsSeqNums.set(ws, socketBoardsSeqNums);
        }
        socketBoardsSeqNums.set(boardId, initialSequenceNumber);
        return initialSequenceNumber;
    }

    async function getEventsSinceLastSnapshot(boardId: string, offset: number): Promise<any[]> {
        const savedEvents = await boards.getBoardEvents(boardId, offset);
        const enqueuedEvents = await eventsManager.getEnqueuedEvents(boardId);
        return savedEvents.concat(enqueuedEvents);
    }

    function hasAnyRightInTokens(ws: WebSocket, boardId: string, rightsTypes: ("reads" | "edits" | "owns")[]): boolean {
        const token = wsTokens.get(ws);
        if (!token) {
            return false;
        }
        const currentTime = Date.now() / 1000; // Convert to seconds
        if (token.exp < currentTime) {
            return false; // Ignore expired tokens
        }
        for (const rightType of rightsTypes) {
            const rights = token[rightType]?.boards;
            if (rights && rights.includes(boardId)) {
                return true; // Found a valid token with the required right
            }
        }
        return false; // No valid token with the required rights
    }

    function getUserFromToken(ws: WebSocket) {
        const token = wsTokens.get(ws);
        if (!token) {
            return null;
        }
        const currentTime = Date.now() / 1000; // Convert to seconds
        if (token.exp < currentTime) {
            return null; // Ignore expired tokens
        }

        return +token.sub;
    }

    async function subscribeClientToBoard(ws: WebSocket, boardId: string): Promise<void> {
        const clients = boardClients.get(boardId) ?? [];
        clients.push(ws);
        boardClients.set(boardId, clients);
    }

    function enforceMode(ws: WebSocket, boardId: string, mode: ViewMode) {
        console.log("Enforce", mode);
        ws.send(
            JSON.stringify({
                type: "Mode",
                boardId: boardId,
                mode,
            })
        );
    }

    const eventsManager = new EventsManager(boards, logger, boardsService);

    async function handleBoardEventMsg(msg: BoardEventMsg, ws: WebSocket): Promise<void> {
        try {
            const mode = await getMode(ws, msg.boardId);
            if (mode) {
                enforceMode(ws, msg.boardId, mode);
            }
            if (!mode) {
                return sendError(ws, "Access denied: edit board.");
            }
        } catch (err) {
            console.error(err);
            return sendError(ws, "Access denied: edit board.");
        }
        const expectedSequence = socketsBoardsSeqNums.get(ws)?.get(msg.boardId) || 1;
        if (msg.sequenceNumber === expectedSequence) {
            const startTime = process.hrtime.bigint();
            const expectedSequence = socketsBoardsSeqNums.get(ws)?.get(msg.boardId) || 1;

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
            try {
                const mode = await getMode(ws, msg.boardId);
                if (mode !== 'edit') {
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
                });

                socketsBoardsSeqNums.get(ws)!.set(msg.boardId, expectedSequence + 1);

                ws.send(
                    JSON.stringify({
                        type: "Confirmation",
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
    }

    async function handlePresenceEventMsg(msg: PresenceEventMsg, ws: WebSocket): Promise<void> {
        try {
            presence.saveEvent(msg);
            broadcastPresenceEvent(msg.boardId, msg);
        } catch (error) {
            logger.error("Failed to process presence event:", error);
            return sendError(ws, "Failed to process presence event.");
        }
    }

    async function hasAccessKeyRights(ws: WebSocket, boardId: number, accessType: AccessKeyType) {
        const accessKey = wsAccessKeys.get(ws);

        if (!accessKey) {
            return false;
        }

        const accessKeyData = await accessKeysService.getAccessKey(boardId, accessKey);

        return accessKeyData?.keyType === accessType;
    }

    async function getMode(ws: WebSocket, boardId: string): Promise<ViewMode | null> {
        const board = await boardsService.get(boardId);
        if (!board) {
            return null;
        }
        const accessKey = wsAccessKeys.get(ws);
        if (accessKey) {
            const hasAccessKeyEditPermission = await hasAccessKeyRights(ws, board.id, AccessKeyType.EDIT);
            if (hasAccessKeyEditPermission) {
                return 'edit';
            }
            const hasAccessKeyViewPermission = await hasAccessKeyRights(ws, board.id, AccessKeyType.VIEW);
            if (hasAccessKeyViewPermission) {
                return 'view';
            }

            return null;
        }

        const userToken = wsTokens.get(ws);
        if (userToken) {
            const hasTokenEditPermission = hasAnyRightInTokens(ws, board.uniqId, ["owns", "edits"]);
            if (hasTokenEditPermission) {
                return 'edit'
            }

            const hasTokenViewPermission = hasAnyRightInTokens(ws, board.uniqId, ["reads"]);
            if (hasTokenViewPermission) {
                return 'view';
            }
        }

        if (board.isPublic) {
            if (board.directAccessType === DirectAccessType.EDIT) {
                return 'edit';
            }

            if (board.directAccessType === DirectAccessType.VIEW) {
                return 'view';
            }
        }

        return null;
    };

    function handleUnsubscribeMsg(msg: UnsubscribeMsg, ws: WebSocket): void {
        const clients = boardClients.get(msg.boardId) ?? [];
        const index = clients.indexOf(ws);
        if (index !== -1) {
            clients.splice(index, 1);
        }
        boardClients.set(msg.boardId, clients);
        wsAccessKeys.delete(ws);
    }

    function sendMessageToClients(message: SocketMsg, clients: WebSocket.WebSocket[]): void {
        const content = JSON.stringify(message);
        for (const client of clients) {
            client.send(content);
        }
    }

    function broadcastBoardEvent(boardUUID: string, message: BoardEventMsg | BoardEventListMsg | ModeMsg | InvalidateRightsMsg): void {
        const clients = boardClients.get(boardUUID) ?? [];
        sendMessageToClients(message, clients);
    }

    function broadcastPresenceEvent(boardUUID: string, msg: PresenceEventMsg): void {
        const clients = boardClients.get(boardUUID) ?? [];
        sendMessageToClients(
            {
                type: "PresenceEvent",
                boardId: msg.boardId,
                event: msg.event,
                userId: msg.userId,
                messageId: msg.messageId,
                nickname: msg.nickname,
                color: msg.color,
                avatar: msg.avatar,
            },
            clients
        );
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

    async function handleSnapshotMsg(snapshotMsg: SnapshotResponseMsg, ws: WebSocket) {
        try {
            const { boardId, snapshot, lastEventOrder } = snapshotMsg;
            const board = await boardsService.get(boardId);
            await boardsService.saveBoardSnapshot({ boardId: board.id, snapshot, lastEventOrder });
            eventsManager.updateSnapshotInfo(boardId, snapshot.lastIndex);
        } catch (error) {
            logger.error(`Failed to process snapshot: ${error}`);
        }
    }

    setInterval(() => {
        for (const [ws, token] of wsTokens.entries()) {
            const currentTime = Date.now() * 0.001;
            if (token.exp <= currentTime) {
                wsTokens.delete(ws);
            }
        }
    }, WS_TOKENS_CLEANUP_INTERVAL);
}

export interface AuthMsg {
    type: "Auth";
    jwt: string;
    connectedBoardId?: string;
}

export interface InvalidateRightsMsg {
    type: "InvalidateRights";
    boardId: string;
    byUser: boolean;
}

export interface GetModeMsg {
    type: "GetMode";
    boardId: string;
}

export interface BoardEventMsg {
    type: "BoardEvent";
    boardId: string;
    event: any;
    sequenceNumber: number;
}

export interface ConfirmationMsg {
    type: "Confirmation";
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
    userId: string;
    accessKey?: string;
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

export type ViewMode = 'view' | 'edit';

export interface ModeMsg {
    type: "Mode";
    boardId: string;
    mode: ViewMode;
}

export interface PingMsg {
    type: "ping";
}

export interface PointerMoveEvent {
    method: "PointerMove";
    position: { x: number; y: number };
    timestamp: number;
}

export interface SelectionEvent {
    method: "Selection";
    selectedItems: string[];
    timestamp: number;
}

export interface SetUserColorEvent {
    method: "SetUserColor";
    timestamp: number;
    color: string;
}

export interface DrawSelectEvent {
    method: "DrawSelect";
    timestamp: number;
    size: {
        left: number;
        top: number;
        right: number;
        bottom: number;
    };
}

export interface CancelDrawSelectEvent {
    method: "CancelDrawSelect";
    timestamp: number;
}

export interface CameraEvent {
    method: "Camera";
    timestamp: number;
    translateX: number;
    translateY: number;
    scaleX: number;
    scaleY: number;
    shearX: number;
    shearY: number;
}

export interface PresencePingEvent {
    method: "Ping";
    timestamp: number;
}

export interface BringToMeEvent {
    method: "BringToMe";
    timestamp: number;
    users: (number | string)[];
}

export interface PresenceUserSnapshot { }

export type PresenceEventType =
    | PointerMoveEvent
    | SelectionEvent
    | SetUserColorEvent
    | DrawSelectEvent
    | CancelDrawSelectEvent
    | CameraEvent
    | PresencePingEvent
    | BringToMeEvent;

export interface UserJoinMsg {
    type: "UserJoin";
    timestamp: number;
    userId: number;
    boardId: string;
    snapshots: Record<string, PresenceUserSnapshot>;
    // events: PresenceEventMsg<PresenceEventType>[];
}

export interface PresenceEventMsg<T = PresenceEventType> {
    type: "PresenceEvent";
    boardId: string;
    event: T;
    userId: string;
    messageId: string;
    nickname: string;
    color: string | null;
    avatar: string | null;
}

export type EventsMsg =
    | ModeMsg
    | BoardEventMsg
    | BoardEventListMsg
    | SnapshotRequestMsg
    | SnapshotResponseMsg
    | SubscribeConfirmationMsg
    | PresenceEventMsg;

export type SocketMsg =
    | EventsMsg
    | AuthMsg
    | UserJoinMsg
    | SubscribeMsg
    | UnsubscribeMsg
    | ErrorMsg
    | ModeMsg
    | ConfirmationMsg
    | PingMsg
    | InvalidateRightsMsg
    | GetModeMsg;

type BoardEventBody = any;

export interface EventMetadata {
    startTime: bigint;
    queueTime: bigint;
}

export class EventsManager {
    readonly processing: string[] = [];

    private lastEventOrders: Map<string, number> = new Map();
    private eventCountSinceLastSnapshot: Map<string, number> = new Map();
    private snapshotRequestTimers: Map<string, NodeJS.Timeout> = new Map();
    private presenceEventHandlers: Map<string, (event: PresenceEventType) => void> = new Map();

    private queues: {
        [boardId: string]: {
            boardId: string;
            events: BoardEventBody[];
            isSaving: boolean;
        };
    } = {};

    constructor(private boards: Boards, private logger: winston.Logger, private boardsService: BoardsService) {
        setInterval(() => {
            this.tryToSaveEvents();
        }, SAVE_EVENTS_INTERVAL);
    }

    async processEvent(boardId: string, eventBody: BoardEventBody, metadata: EventMetadata): Promise<BoardEventData> {
        const newOrder = await this.incrementLastEventOrder(boardId);

        const data = this.enqueueEventForSaving(boardId, eventBody, metadata, newOrder);

        const eventCount = await this.incrementEventCountSinceSnapshot(boardId);

        if (eventCount >= SNAPSHOT_EVENTS_TO_REQUEST) {
            this.requestSnapshotIfNotAlreadyRequested(boardId);
        }

        return data;
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
        this.eventCountSinceLastSnapshot.set(boardId, 0);
        this.lastEventOrders.set(boardId, lastEventOrder);

        // Clear any existing timers when snapshot is received
        if (this.snapshotRequestTimers.has(boardId)) {
            clearTimeout(this.snapshotRequestTimers.get(boardId));
            this.snapshotRequestTimers.delete(boardId);
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
            await this.boardsService.addEvents(boardId, events);
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
        const queue = this.queues[boardId];
        let events = [];
        if (queue) {
            events = queue.events;
        }
        return events;
    }

    requestSnapshotCallback(boardId: string, sinceLast: number): void { }

    isBoardReady(boardId: string): boolean {
        return !this.processing.includes(boardId);
    }
}

function isNaturalNumber(order: number): boolean {
    return typeof order === "number" && order >= 0 && Number.isInteger(order);
}
