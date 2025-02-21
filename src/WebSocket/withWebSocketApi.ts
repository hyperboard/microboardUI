import { ImageGenerator } from "../ai/openai/image-generator";
import { OpenAI } from "ai/openai";
import { ChatStreamHandler } from "ai/openai/ChatStreamHandler";
import { AccessKeyType } from "drizzle/entities/boardAccessKeys";
import { DirectAccessType } from "drizzle/entities/boards";
import { AccessToken } from "Interface";
import { boardEventTotalLatency, websocketEventQueueSize } from "Metrics/metrics";
import { Redis } from "Redis";
import { DevelopersService } from "Routes/V1/Developers/Service";
import type { AccessKeysService } from "Routes/V1/Boards/access-keys.service";
import type { BoardEventData, BoardsService } from "Routes/V1/Boards/boards.service";
import { verifyToken } from "Tokens";
import { isUUID } from "validator";
import winston from "winston";
import WebSocket, { WebSocketServer } from "ws";
import { AiChatMsg, getAIChatMsgHandler } from "./ai-chat";
import { Presence } from "./Presence";
import { WebSocketRouter } from "./WebSocketRouter";
import { z } from "zod";
import { WsError } from "./wsError";
import { TelegramService } from "services/TelegramService";
import { getAppVersion } from "../shared/utils/getAppVersion";
import { StripeService } from "Routes/V1/Billing/stripe";
import { CryptoService } from "Routes/V1/Crypto/cryptoService";

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const TEN_MINUTES = 10 * MINUTE;
const WS_TOKENS_CLEANUP_INTERVAL = TEN_MINUTES;
const SAVE_EVENTS_INTERVAL = 1000;
const SNAPSHOT_EVENTS_TO_REQUEST = 100;
const SNAPSHOT_RETRY_TIMEOUT = 2 * MINUTE;
const SNAPSHOT_REQUEST_TIMEOUT = 10 * SECOND;
const PERIODIC_SNAPSHOT_INTERVAL = 30 * MINUTE;
const REDIS_BOARD_FIRST_EVENT_KEY = "board:first_event:";
const REDIS_BOARD_LAST_SNAPSHOT_KEY = "board:last_snapshot:";
const CURRENT_VERSION = getAppVersion();

export type WebSocketType = { chatStreamHandler: ChatStreamHandler };

export function withWebSocketApi({
    wss,
    accessKeysService,
    logger,
    redis,
    boardsService,
    openai,
    imageGenerator,
    telegramService,
    developersService,
    stripeService,
    cryptoService,
}: {
    wss: WebSocketServer;
    accessKeysService: AccessKeysService;
    logger: winston.Logger;
    redis: Redis;
    boardsService: BoardsService;
    openai: OpenAI;
    imageGenerator: ImageGenerator;
    telegramService: TelegramService;
    developersService: DevelopersService;
    stripeService: StripeService;
    cryptoService: CryptoService;
}): WebSocketType {
    const boardClients = new Map<string, WebSocket.WebSocket[]>();
    const wsTokens = new Map<WebSocket, AccessToken>();
    const wsAccessKeys = new Map<WebSocket, string>();
    const snapshotRequestTimers = new Map<string, NodeJS.Timeout>();
    const presence = new Presence(redis);
    const chatStreamHandler = new ChatStreamHandler({
        stripeService,
        cryptoService,
        openai,
        logger,
        redis,
        telegramService,
    });

    developersService.setBroadcastEventFunction((boardUUID: string, eventData: any) => {
        const clients = boardClients.get(boardUUID) ?? [];
        sendWsMsg(clients, {
            type: "BoardEvent",
            boardId: boardUUID,
            event: { body: eventData, order: eventData.order },
            sequenceNumber: 1, // FIXME: API events don't need sequence numbers
        });
    });

    developersService.setBroadcastEventFunction((boardUUID: string, eventData: any) => {
        const clients = boardClients.get(boardUUID) ?? [];
        sendWsMsg(clients, {
            type: "BoardEvent",
            boardId: boardUUID,
            event: { body: eventData, order: eventData.order },
            sequenceNumber: 1, // FIXME: API events don't need sequence numbers
        });
    });

    wss.on("connection", (ws) => {
        if (CURRENT_VERSION) {
            ws.send(JSON.stringify({ type: "VersionCheck", version: CURRENT_VERSION }));
        }

        ws.on("message", async (data) => {
            try {
                const msg = JSON.parse(data.toString()) as SocketMsg;
                handleMessage(ws, msg);
            } catch (error) {
                handleError(ws, error, "Error parsing JSON message");
                ws.close();
            }
        });
        ws.on("error", (err) => {
            logger.error("WebSocket error:", err);
            ws.close();
        });
        ws.on("close", () => {
            disconnectClientFromBoards(ws);
        });
    });

    async function sendInvalidateRightsMsg(boardUUID: string, byUser = false) {
        const clients = boardClients.get(boardUUID) ?? [];
        sendWsMsg(clients, {
            type: "InvalidateRights",
            boardId: boardUUID,
            byUser,
        });
    }
    boardsService.setInvalidateBoardRights(sendInvalidateRightsMsg);

    async function handleMessage(ws: WebSocket, msg: SocketMsg) {
        switch (msg.type) {
            case "Auth":
                return handleAuthMsg(msg, ws).catch((error) => {
                    handleError(ws, error, "Failed to authenticate");
                });
            case "Logout":
                return handleLogoutMsg(msg, ws);
            case "Subscribe":
                return handleSubscribeMsg(msg, ws).catch((error) => {
                    unsubscribeClient(msg.boardId, ws);
                    handleError(ws, error, "Failed to subscribe to board events");
                });
            case "Unsubscribe":
                return handleUnsubscribeMsg(msg, ws);
            case "BoardEvent":
                return handleBoardEventMsg(msg, ws).catch((error) =>
                    handleError(ws, error, "Failed to process board event")
                );
            case "AiChat":
                return handleAiChatMessage(msg, ws).catch((error) => {
                    const operationContext = {
                        boardId: msg.boardId,
                        itemId: "itemId" in msg.event ? msg.event.itemId : "unknown",
                        requestType: "text" as const,
                        startTime: Date.now(),
                        model: "model" in msg.event ? msg.event.model : "unknown",
                        pipelineSteps: [
                            { name: "Initialize Operation", status: "error" as const },
                            { name: "Check Usage Limits", status: "pending" as const },
                            { name: "Create Chat", status: "pending" as const },
                            { name: "Setup Context", status: "pending" as const },
                            { name: "Generate Response", status: "pending" as const },
                            { name: "Save Message", status: "pending" as const },
                        ],
                    };

                    telegramService.broadcastMessage(error?.message || "Unknown error", {
                        boardId: msg.boardId,
                        msg: msg,
                        operationContext,
                    });
                    handleError(ws, error, "Failed to process AI chat message");
                });
            case "PresenceEvent":
                return handlePresenceEventMsg(msg, ws).catch((error) => {
                    handleError(ws, error, "Failed to process presence event");
                });
            case "BoardSnapshot":
                return handleSnapshotMsg(msg, ws).catch((error) => {
                    handleError(ws, error, "Failed to process snapshot");
                });
            case "GetMode":
                return handleGetModeMsg(msg, ws).catch((error) => {
                    unsubscribeClient(msg.boardId, ws);
                    handleError(ws, error, "Failed to get access mode");
                });
            case "ping":
                return handlePingMsg(msg, ws);
        }
    }

    const handleAiChatMessage = getAIChatMsgHandler({
        openai,
        logger,
        boardClients,
        chatStreamHandler,
        imageGenerator,
    });

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
        authenticateUser(msg, ws);
        sendAuthSuccess(msg, ws);
    }

    async function authenticateUser(msg: AuthMsg, ws: WebSocket): Promise<void> {
        const token = await verifyToken(msg.jwt, "access");
        if (!token) {
            throw new Error("Invalid or expired token");
        }
        wsTokens.set(ws, token);
    }

    async function sendAuthSuccess(msg: AuthMsg, ws: WebSocket): Promise<void> {
        sendWsMsg(ws, { type: "AuthConfirmation" });
    }

    async function handleError(ws: WebSocket, error: unknown, context: string): Promise<void> {
        const msg = getErrorMsg(error, context);
        logger.error(msg);
        logger.error(error);
        if (error instanceof WsError) {
            return sendWsMsg(ws, error);
        }
        sendWsMsg(ws, { type: "Error", message: msg });
    }

    function getErrorMsg(error: unknown, msg: string): string {
        return `${msg}: ${error instanceof Error ? error.message : "An unexpected error occurred"}`;
    }

    function sendWsMsg(clients: WebSocket.WebSocket | WebSocket.WebSocket[], data: any): void {
        const clientsArray = Array.isArray(clients) ? clients : [clients];
        const msg = JSON.stringify(data);
        for (const client of clientsArray) {
            client.send(msg);
        }
    }

    function handlePingMsg(_msg: PingMsg, ws: WebSocket): void {
        sendWsMsg(ws, { type: "pong" });
    }

    function handleLogoutMsg(_msg: LogoutMsg, ws: WebSocket) {
        wsTokens.delete(ws);
    }

    async function handleGetModeMsg(msg: GetModeMsg, ws: WebSocket) {
        enshureValidBoardId(msg.boardId);
        const mode = await getAccessMode(ws, msg.boardId);
        sendAccessMode(ws, msg.boardId, mode);
    }

    const socketsBoardsSeqNums = new Map<WebSocket, Map<string, number>>();

    function enshureValidBoardId(boardId: string): void {
        if (!isUUID(boardId)) {
            throw new Error(`Invalid Board Id: ${boardId}`);
        }
    }

    async function handleSubscribeMsg(msg: SubscribeMsg, ws: WebSocket): Promise<void> {
        enshureValidBoardId(msg.boardId);
        if (msg.accessKey) {
            wsAccessKeys.set(ws, msg.accessKey);
        }
        const mode = await getAccessMode(ws, msg.boardId);

        subscribeClientToBoard(ws, msg.boardId);

        await sendSubscriptionCompleted(ws, msg.boardId, mode);

        await sendPresenceSnapshots(msg.boardId, ws, msg);
    }

    async function sendSubscriptionCompleted(ws: WebSocket, boardId: string, mode: string) {
        const initialSequenceNumber = getInitialSeqNum(ws, boardId);
        const snapshot = await boardsService.getLatestBoardSnapshot(boardId);
        const lastSnapshotEventOrder = snapshot?.lastIndex || 0;
        const eventsSinceLastSnapshot = await getEventsSinceLastSnapshot(boardId, lastSnapshotEventOrder);
        /*
        error: Failed to subscribe to board events: Do not know how to serialize a BigInt
        error: Do not know how to serialize a BigInt
        "stack":"TypeError: Do not know how to serialize a BigInt\n    
        at JSON.stringify (<anonymous>)\n    
        at sendWsMsg (/usr/api/dist/api.js:916567:22)\n    
        at sendSubscriptionCompleted (/usr/api/dist/api.js:916604:5)\n    
        at process.processTicksAndRejections (node:internal/process/task_queues:95:5)\n    
        at async handleSubscribeMsg (/usr/api/dist/api.js:916596:5)"}}
        */
        sendWsMsg(ws, {
            type: "BoardSubscriptionCompleted",
            boardId,
            mode,
            snapshot,
            lastSnapshotEventOrder,
            eventsSinceLastSnapshot,
            initialSequenceNumber,
        });

        const eventsSinceLastSnapshotCount = await eventsManager.getEventCountSinceLastSnapshot(boardId);
        if (eventsSinceLastSnapshotCount >= SNAPSHOT_EVENTS_TO_REQUEST) {
            eventsManager.requestSnapshotIfNotAlreadyRequested(boardId);
        }
    }

    async function sendPresenceSnapshots(boardId: string, ws: WebSocket, msg: SubscribeMsg) {
        const snapshots = await presence.createBoardPresenceSnapshots(boardId);
        sendWsMsg(ws, {
            type: "UserJoin",
            boardId: boardId,
            userId: msg.userId,
            snapshots: snapshots,
            timestamp: Date.now(),
        });
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
        const savedEvents = await boardsService.getBoardEvents(boardId, offset);
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

    function subscribeClientToBoard(ws: WebSocket, boardId: string): void {
        const clients = boardClients.get(boardId) ?? [];
        clients.push(ws);
        boardClients.set(boardId, clients);
    }

    function sendAccessMode(ws: WebSocket, boardId: string, mode: AccessMode) {
        sendWsMsg(ws, {
            type: "Mode",
            boardId: boardId,
            mode,
        });
    }

    const eventsManager = new EventsManager(logger, boardsService, redis, boardClients);

    async function handleBoardEventMsg(msg: BoardEventMsg, ws: WebSocket): Promise<void> {
        const startTime = process.hrtime.bigint();
        enshureEditMode(msg.boardId, ws);
        enshureExpectedSequenceNumber(msg, ws);

        const eventData = await eventsManager.processEvent(msg.boardId, msg.event.body, {
            startTime: startTime,
            queueTime: process.hrtime.bigint(),
        });
        sendBoardEventConfirmation(ws, msg, eventData);
        broadcastBoardEvent(msg.boardId, msg, eventData);

        const totalEndTime = process.hrtime.bigint();
        const totalLatency = Number(totalEndTime - startTime);
        boardEventTotalLatency.observe(totalLatency);
    }

    function sendBoardEventConfirmation(ws: WebSocket, msg: BoardEventMsg, eventData: BoardEventData) {
        sendWsMsg(ws, {
            type: "Confirmation",
            boardId: msg.boardId,
            sequenceNumber: msg.sequenceNumber,
            order: eventData.order,
        });
    }

    async function enshureEditMode(boardId: string, ws: WebSocket): Promise<void> {
        try {
            const mode = await getAccessMode(ws, boardId);
            if (mode !== "edit") {
                throw new Error(`board id:${boardId}`);
            }
            sendAccessMode(ws, boardId, mode);
        } catch (error) {
            unsubscribeClient(boardId, ws);
            throw error;
        }
    }

    function enshureExpectedSequenceNumber(msg: BoardEventMsg, ws: WebSocket): void {
        const boardsSeqNums = getSocketBoardSeqNums(ws);
        const expectedSeqNum = boardsSeqNums.get(msg.boardId) || 1;
        if (msg.sequenceNumber !== expectedSeqNum) {
            throw new Error(
                "Unexpected sequence number" +
                    JSON.stringify({
                        expectedSeqNum,
                        receivedSeqNum: msg.sequenceNumber,
                        boardId: msg.boardId,
                    })
            );
        }
        boardsSeqNums.set(msg.boardId, expectedSeqNum + 1);
    }

    function getSocketBoardSeqNums(ws: WebSocket): Map<string, number> {
        const foundMap = socketsBoardsSeqNums.get(ws);
        if (!foundMap) {
            const newMap = new Map();
            socketsBoardsSeqNums.set(ws, newMap);
            return newMap;
        }
        return foundMap;
    }

    async function handlePresenceEventMsg(msg: PresenceEventMsg, ws: WebSocket): Promise<void> {
        presence.saveEvent(msg);
        broadcastPresenceEvent(msg.boardId, msg);
    }

    async function hasAccessKeyRights(ws: WebSocket, boardId: number, accessType: AccessKeyType) {
        const accessKey = wsAccessKeys.get(ws);

        if (!accessKey) {
            return false;
        }

        const accessKeyData = await accessKeysService.getAccessKey(boardId, accessKey);

        return accessKeyData?.keyType === accessType;
    }

    async function getAccessMode(ws: WebSocket, boardId: string): Promise<AccessMode> {
        const board = await boardsService.get(boardId);
        if (!board) {
            throw new WsError("Board not found", boardId);
        }
        const accessKey = wsAccessKeys.get(ws);
        if (accessKey) {
            const hasAccessKeyEditPermission = await hasAccessKeyRights(ws, board.id, AccessKeyType.EDIT);
            if (hasAccessKeyEditPermission) {
                return "edit";
            }
            const hasAccessKeyViewPermission = await hasAccessKeyRights(ws, board.id, AccessKeyType.VIEW);
            if (hasAccessKeyViewPermission) {
                return "view";
            }

            throw new WsError("Invalid access key", boardId);
        }

        const userToken = wsTokens.get(ws);
        if (userToken) {
            const hasTokenEditPermission = hasAnyRightInTokens(ws, board.uniqId, ["owns", "edits"]);
            if (hasTokenEditPermission) {
                return "edit";
            }

            const hasTokenViewPermission = hasAnyRightInTokens(ws, board.uniqId, ["reads"]);
            if (hasTokenViewPermission) {
                return "view";
            }
        }

        if (board.isPublic) {
            if (board.directAccessType === DirectAccessType.EDIT) {
                return "edit";
            }

            if (board.directAccessType === DirectAccessType.VIEW) {
                return "view";
            }
        }

        throw new WsError("Not authorized", boardId);
    }

    function handleUnsubscribeMsg(msg: UnsubscribeMsg, ws: WebSocket): void {
        unsubscribeClient(msg.boardId, ws);
    }

    function unsubscribeClient(boardId: string, ws: WebSocket) {
        const clients = boardClients.get(boardId) ?? [];
        const index = clients.indexOf(ws);
        if (index !== -1) {
            clients.splice(index, 1);
        }
        boardClients.set(boardId, clients);
        wsAccessKeys.delete(ws);

        // If no clients left, clean up periodic snapshot timer
        if (clients.length === 0) {
            const periodicTimer = eventsManager.getPeriodicSnapshotTimer(boardId);
            if (periodicTimer) {
                clearInterval(periodicTimer);
                eventsManager.clearPeriodicSnapshotTimer(boardId);
            }
        }
    }

    function broadcastBoardEvent(boardUUID: string, msg: BoardEventMsg, eventData: BoardEventData): void {
        const clients = boardClients.get(boardUUID) ?? [];
        sendWsMsg(clients, {
            type: msg.type,
            boardId: msg.boardId,
            event: { body: eventData, order: eventData.order },
            sequenceNumber: msg.sequenceNumber,
        });
    }

    function broadcastPresenceEvent(boardUUID: string, msg: PresenceEventMsg): void {
        const clients = boardClients.get(boardUUID) ?? [];
        sendWsMsg(clients, {
            type: "PresenceEvent",
            boardId: msg.boardId,
            event: msg.event,
            userId: msg.userId,
            messageId: msg.messageId,
            nickname: msg.nickname,
            color: msg.color,
            avatar: msg.avatar,
            hardId: msg.hardId,
            softId: msg.softId,
        });
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
        sendWsMsg(ws, {
            type: "CreateSnapshotRequest",
            boardId: boardId,
            sinceLast,
        });
    }

    function setupSnapshotRequestTimeout(boardId: string, client: WebSocket, sinceLast: number): void {
        clearTimeout(snapshotRequestTimers.get(boardId));
        const timer = setTimeout(() => {
            requestSnapshotFromClient(boardId, sinceLast);
        }, SNAPSHOT_RETRY_TIMEOUT);
        snapshotRequestTimers.set(boardId, timer);
    }

    async function handleSnapshotMsg(snapshotMsg: SnapshotResponseMsg, ws: WebSocket) {
        const { boardId, snapshot, lastEventOrder } = snapshotMsg;
        const board = await boardsService.get(boardId);
        await boardsService.saveBoardSnapshot({ boardId: board.id, snapshot, lastEventOrder });
        eventsManager.updateSnapshotInfo(boardId, snapshot.lastIndex);

        // Invalidate Redis cache when new snapshot is received
        const developersService = new DevelopersService(boardsService, logger, redis);
        await developersService.handleBoardSnapshot(boardId);
    }

    setInterval(() => {
        for (const [ws, token] of wsTokens.entries()) {
            const currentTime = Date.now() * 0.001;
            if (token.exp <= currentTime) {
                wsTokens.delete(ws);
            }
        }
    }, WS_TOKENS_CLEANUP_INTERVAL);

    return {
        chatStreamHandler,
    };
}

export interface AuthMsg {
    type: "Auth";
    jwt: string;
}

export interface AuthConfirmationMsg {
    type: "AuthConfirmation";
}

export interface LogoutMsg {
    type: "Logout";
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

export type AccessMode = "view" | "edit";

export interface ModeMsg {
    type: "Mode";
    boardId: string;
    mode: AccessMode;
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

export interface PresenceUserSnapshot {}

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
    softId: string | null;
    hardId: string | null;
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
    | PresenceEventMsg
    | AiChatMsg;

export type SocketMsg =
    | EventsMsg
    | AuthMsg
    | LogoutMsg
    | UserJoinMsg
    | SubscribeMsg
    | UnsubscribeMsg
    | ErrorMsg
    | ModeMsg
    | ConfirmationMsg
    | PingMsg
    | InvalidateRightsMsg
    | GetModeMsg
    | AiChatMsg;

type BoardEventBody = any;

export interface EventMetadata {
    startTime: bigint;
    queueTime: bigint;
}

export class EventsManager {
    readonly processing: string[] = [];
    private readonly BOARD_LAST_ORDER_KEY = "board:last_order:";
    private eventCountSinceLastSnapshot: Map<string, number> = new Map();
    private snapshotRequestTimers: Map<string, NodeJS.Timeout> = new Map();
    private periodicSnapshotTimers: Map<string, NodeJS.Timeout> = new Map();
    private presenceEventHandlers: Map<string, (event: PresenceEventType) => void> = new Map();
    private boardClients: Map<string, WebSocket.WebSocket[]>;

    private queues: {
        [boardId: string]: {
            boardId: string;
            events: BoardEventBody[];
            isSaving: boolean;
        };
    } = {};

    requestSnapshotCallback: (boardId: string, sinceLast: number) => void = () => {};

    constructor(
        private logger: winston.Logger,
        private boardsService: BoardsService,
        private redis: Redis,
        boardClients: Map<string, WebSocket.WebSocket[]>
    ) {
        this.boardClients = boardClients;
        setInterval(() => {
            this.tryToSaveEvents();
        }, SAVE_EVENTS_INTERVAL);
    }

    async processEvent(boardId: string, eventBody: BoardEventBody, metadata: EventMetadata): Promise<BoardEventData> {
        const newOrder = await this.incrementLastEventOrder(boardId);
        const data = this.enqueueEventForSaving(boardId, eventBody, metadata, newOrder);

        const isFirstEvent = await this.checkAndMarkFirstEvent(boardId);
        if (isFirstEvent) {
            this.requestSnapshotIfNotAlreadyRequested(boardId);
            this.setupPeriodicSnapshot(boardId);
        }

        const eventCount = await this.incrementEventCountSinceSnapshot(boardId);
        if (eventCount >= SNAPSHOT_EVENTS_TO_REQUEST) {
            this.requestSnapshotIfNotAlreadyRequested(boardId);
        }

        return data;
    }

    private async checkAndMarkFirstEvent(boardId: string): Promise<boolean> {
        const key = REDIS_BOARD_FIRST_EVENT_KEY + boardId;
        const existingEvent = await this.redis.client.get(key);
        if (existingEvent) {
            return false;
        }
        const result = await this.redis.client.set(key, "1", "EX", 24 * 60 * 60); // 24 hours
        return result === "OK";
    }

    private setupPeriodicSnapshot(boardId: string): void {
        if (this.periodicSnapshotTimers.has(boardId)) {
            clearInterval(this.periodicSnapshotTimers.get(boardId));
        }

        const timer = setInterval(async () => {
            const clients = this.boardClients.get(boardId);
            if (clients && clients.length > 0) {
                const lastSnapshotTime = await this.getLastSnapshotTime(boardId);
                const now = Date.now();

                if (!lastSnapshotTime || now - lastSnapshotTime >= PERIODIC_SNAPSHOT_INTERVAL) {
                    this.requestSnapshotIfNotAlreadyRequested(boardId);
                }
            }
        }, PERIODIC_SNAPSHOT_INTERVAL);

        this.periodicSnapshotTimers.set(boardId, timer);
    }

    private async getLastSnapshotTime(boardId: string): Promise<number | null> {
        const key = REDIS_BOARD_LAST_SNAPSHOT_KEY + boardId;
        const time = await this.redis.client.get(key);
        return time ? parseInt(time) : null;
    }

    private async updateLastSnapshotTime(boardId: string): Promise<void> {
        const key = REDIS_BOARD_LAST_SNAPSHOT_KEY + boardId;
        await this.redis.client.set(key, Date.now().toString(), "EX", 24 * 60 * 60); // 24 hours
    }

    updateSnapshotInfo(boardId: string, lastEventOrder: number): void {
        this.eventCountSinceLastSnapshot.set(boardId, 0);
        this.updateLastSnapshotTime(boardId);

        if (this.snapshotRequestTimers.has(boardId)) {
            clearTimeout(this.snapshotRequestTimers.get(boardId));
            this.snapshotRequestTimers.delete(boardId);
        }
    }

    getPeriodicSnapshotTimer(boardId: string): NodeJS.Timeout | undefined {
        return this.periodicSnapshotTimers.get(boardId);
    }

    clearPeriodicSnapshotTimer(boardId: string): void {
        this.periodicSnapshotTimers.delete(boardId);
    }

    async incrementLastEventOrder(boardUuid: string): Promise<number> {
        const key = this.BOARD_LAST_ORDER_KEY + boardUuid;
        const order = await this.redis.client.get(key);

        if (!order) {
            const lastOrder = await this.getLastEventOrder(boardUuid);
            await this.redis.client.set(key, lastOrder.toString());
            const newOrder = lastOrder + 1;
            await this.redis.client.set(key, newOrder.toString());
            return newOrder;
        }

        const newOrder = parseInt(order) + 1;
        await this.redis.client.set(key, newOrder.toString());
        return newOrder;
    }

    async getLastEventOrder(boardUuid: string): Promise<number> {
        const key = this.BOARD_LAST_ORDER_KEY + boardUuid;
        const order = await this.redis.client.get(key);

        if (!order) {
            const dbOrder = await this.boardsService.getLastEventOrderForBoard(boardUuid);
            if (!isNaturalNumber(dbOrder)) {
                throw new Error(`Error processing event: board ${boardUuid} not found`);
            }
            await this.redis.client.set(key, dbOrder.toString());
            return dbOrder;
        }

        return parseInt(order);
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
            eventCount = await this.boardsService.getEventCountSinceLastSnapshot(boardUuid);
            if (!isNaturalNumber(eventCount)) {
                throw new Error(`Error processing event: board ${boardUuid} not found`);
            }
            this.eventCountSinceLastSnapshot.set(boardUuid, eventCount);
        }
        return eventCount;
    }

    requestSnapshotIfNotAlreadyRequested(boardId: string): void {
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

    async tryToSaveEvents(): Promise<void> {
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
    ): Promise<void> {
        const events = eventQueue.map((event) => event.data);

        try {
            await this.boardsService.addEvents(boardId, events);
        } catch (error) {
            throw error;
        }
    }

    async getEnqueuedEvents(boardId: string): Promise<any[]> {
        const queue = this.queues[boardId];
        let events = [];
        if (queue) {
            events = queue.events;
        }
        return events.map((event) => {
            return { body: event.data, order: event.data.order };
        });
    }

    isBoardReady(boardId: string): boolean {
        return !this.processing.includes(boardId);
    }
}

function isNaturalNumber(order: number): boolean {
    return typeof order === "number" && order >= 0 && Number.isInteger(order);
}
