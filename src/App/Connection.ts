import { Board, BoardSnapshot } from "Board/Board";
import { SyncBoardEvent, SyncEvent } from "Board/Events/Events";
import {
	PresenceEventMsg,
	PresenceEventType,
	UserJoinMsg,
} from "Board/Presence/Events";
import { getApiUrl } from "Config";
import { Subject } from "Subject";
import { getWebsocketUrl } from "../Config";
import { Account } from "./Account";
import { Storage } from "./Storage";

const SECOND = 1000;
const WS_RECONNECT_TIMEOUT = 5 * SECOND;
const WS_PING_INTERVAL = 10 * SECOND;
const SUBSCRIBE_TIMEOUT = 4 * SECOND;

export interface AuthMsg {
	type: "Auth";
	jwt: string;
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
	event: SyncEvent;
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
	events: SyncBoardEvent[];
}

export interface SubscribeMsg {
	type: "Subscribe";
	boardId: string;
	userId: string;
	index: number;
	accessKey?: string;
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
	snapshot: BoardSnapshot;
	lastEventOrder: number;
}

export type ViewMode = "view" | "edit" | "loading";

export interface ModeMsg {
	type: "Mode";
	boardId: string;
	mode: ViewMode;
}

export interface AuthConfirmationMsg {
	type: "AuthConfirmation";
}

export interface PingMsg {
	type: "ping";
}

export interface BoardSubscriptionCompletedMsg {
	type: "BoardSubscriptionCompleted";
	boardId: string;
	mode: "view" | "edit";
	snapshot: BoardSnapshot | null;
	lastSnapshotEventOrder: number;
	eventsSinceLastSnapshot: SyncBoardEvent[];
	initialSequenceNumber: number;
}

export interface AiChatMsg<T = AiChatEventType> {
	type: "AiChat";
	boardId: string;
	event: T;
}

export type AiChatEventType = UserRequest | ChatChunk;

export type OpenAIModels =
	| "gpt-3.5-turbo"
	| "gpt-4"
	| "gpt-4o"
	| "gpt-4o-mini"
	| "gpt-4-32k"
	| "gpt-3.5-turbo-0613"
	| "gpt-4-0613"
	| "gpt-3.5-turbo-16k"
	| "gpt-4-16k"
	| "o1-mini"
	| "o1";
export interface UserRequest {
	method: "UserRequest";
	context: number[];
	boardContext: string[];
	idea: string;
	model?: OpenAIModels;
	itemId: string;
}

export interface ChatChunk {
	method: "ChatChunk";
	chatId: number;
	type: "chunk" | "done" | "end" | "error";
	itemId: string;
	content?: string;
	error?: string;
}

export type EventsMsg =
	| ModeMsg
	| BoardEventMsg
	| BoardEventListMsg
	| SnapshotRequestMsg
	| SnapshotResponseMsg
	| SubscribeConfirmationMsg
	| ConfirmationMsg
	| BoardSubscriptionCompletedMsg
	| UserJoinMsg
	| PresenceEventMsg
	| AiChatMsg;

export type SocketMsg =
	| EventsMsg
	| AuthMsg
	| AuthConfirmationMsg
	| LogoutMsg
	| GetModeMsg
	| InvalidateRightsMsg
	| UserJoinMsg
	| SubscribeMsg
	| UnsubscribeMsg
	| ErrorMsg
	| ModeMsg
	| PingMsg
	| AiChatMsg;

export interface Connection {
	connectionId: number;
	userId: number;
	connect(): Promise<void>;
	subscribe(
		boardId: string,
		callback: (serverMessage: EventsMsg) => void,
		getLastOrder: () => number,
		accessKey?: string,
	): void;
	unsubscribe(
		boardId: string,
		callback: (serverMessage: EventsMsg) => void,
	): void;
	publishBoardEvent(
		boardId: string,
		event: SyncEvent,
		sequenceNumber: number,
	): void;
	publishPresenceEvent(boardId: string, event: PresenceEventType): void;
	publishAuth(): Promise<void>;
	publishLogout(): void;
	publishGetMode(): void;
	publishSnapshot(boardId: string, snapshot: BoardSnapshot): void;
	wsClient: WsClient;
	onMessage?: (msg: SocketMsg) => void;
}

interface Subscription {
	publish: (message: EventsMsg) => void;
	subscribe: () => void;
	unsubscribe: () => void;
}

export function createConnection(
	getBoard: () => Board,
	getAccount: () => Account,
	getStorage: () => Storage,
): Connection {
	const subscriptions = new Map<string, Subscription>();

	const onConnectionLost = (): void => {
		postDisconnectedMsg();
	};

	const onErorr = (error: unknown): void => {
		const err = error as Error;
		console.error("Error Establishing Connection:", err);
		onConnectionLost();
		window.parent.postMessage(
			{
				pattern: "MicroboardError",
				payload: JSON.stringify({
					error: err.message,
				}),
			},
			"*",
		);
	};

	const setConnectionErrorTimeout = (): void => {
		setTimeout(onConnectionLost, WS_PING_INTERVAL + 1);
	};

	const subscribeTimeouts = new Map<
		string,
		{ timeout: NodeJS.Timeout; time: number }
	>();

	function clearConnectionError(): void {
		getBoard().events?.removeBeforeUnloadListener();
	}

	function onMessage(msg: SocketMsg): void {
		if (connection.onMessage) {
			connection.onMessage(msg);
		}
		const board = getBoard();
		clearConnectionError();
		switch (msg.type) {
			case "SubscribeConfirmation":
			case "Confirmation":
			case "BoardEvent":
			case "BoardEventList":
			case "BoardSnapshot":
			case "CreateSnapshotRequest":
			case "BoardSubscriptionCompleted":
			case "UserJoin":
			case "Mode":
			case "PresenceEvent":
				const subscribeTimeout = subscribeTimeouts.get(msg.boardId);
				if (subscribeTimeout) {
					clearTimeout(subscribeTimeout.timeout);
					subscribeTimeouts.delete(msg.boardId);
				}
				const subscription = subscriptions.get(msg.boardId);
				if (!subscription) {
					console.warn(
						`Debug: No subscription found for boardId ${msg.boardId}`,
					);
					return;
				}
				subscription.publish(msg);
				break;
			case "Subscribe":
			case "Unsubscribe":
			case "Error":
			case "ping":
				board.presence.ping();
				break;
			case "AuthConfirmation":
				publishGetMode();
				break;
			case "InvalidateRights":
				const account = getAccount();
				if (account.isLoggedIn) {
					publishAuth();
				} else {
					publishGetMode();
				}
				break;
			default:
				console.warn("Debug: Received unknown message type:", msg.type);
		}
	}
	const ws = createWsClient(onMessage, setConnectionErrorTimeout, onErorr);

	async function connect(): Promise<void> {
		try {
			postConnectingMsg();
			const response = await fetch(`${getApiUrl()}/connection`, {
				method: "GET",
				mode: "cors",
				cache: "no-cache",
				credentials: "same-origin",
				headers: {
					"Content-Type": "application/json",
				},
				redirect: "follow",
				referrerPolicy: "no-referrer",
			});
			if (!response.ok) {
				throw new Error("response not OK");
			}
			postConnectedMsg();
			const data = await response.json();
			connectionId = data.connection;
		} catch (error) {
			onErorr(error);
		}
	}

	function subscribe(
		boardId: string,
		callback: (serverMessage: EventsMsg) => void,
		getLastOrder: () => number,
		accessKey?: string,
	): void {
		const subject = subscriptions.get(boardId);
		if (subject) {
			return;
		}

		function onSocketOpen(): void {
			sendSubscribeMsg();
		}

		function subscribe(): void {
			ws.onOpenSubject.subscribe(onSocketOpen);
			sendSubscribeMsg();
		}

		async function sendSubscribeMsg(): Promise<void> {
			console.log("send subscribe msg");
			await publishAuth();
			console.log("send subscribe after auth");
			let subscribeTimeout = subscribeTimeouts.get(boardId);
			if (!subscribeTimeout) {
				subscribeTimeout = {
					timeout: setTimeout(sendSubscribeMsg, SUBSCRIBE_TIMEOUT),
					time: SUBSCRIBE_TIMEOUT,
				};
			} else {
				clearTimeout(subscribeTimeout.timeout);
				subscribeTimeout.time *= 2;
				subscribeTimeout.timeout = setTimeout(
					sendSubscribeMsg,
					subscribeTimeout.time,
				);
			}
			subscribeTimeouts.set(boardId, subscribeTimeout);

			const storage = getStorage();
			const generatedClientId = storage.getUser()
				? storage.getUser()!
				: storage.setUser();

			ws.send({
				type: "Subscribe",
				boardId,
				index: getLastOrder(),
				userId: generatedClientId,
				accessKey,
			});

			console.log("send subscribe msg end");
		}

		function unsubscribe(): void {
			ws.onOpenSubject.unsubscribe(onSocketOpen);
			sendUnsubscribeMsg();
			postDisconnectedMsg();
		}

		function sendUnsubscribeMsg(): void {
			ws.send({ type: "Unsubscribe", boardId: boardId });
		}

		subscriptions.set(boardId, {
			publish: callback,
			subscribe,
			unsubscribe,
		});

		subscribe();
	}

	function unsubscribe(boardId: string): void {
		const subscription = subscriptions.get(boardId);
		if (!subscription) {
			return;
		}
		subscription.unsubscribe();
		subscriptions.delete(boardId);

		window.parent.postMessage(
			{
				pattern: "connectionState",
				payload: "disconnected",
			},
			"*",
		);
	}

	async function publishAuth(): Promise<void> {
		try {
			const account = getAccount();
			await account.refreshTokens();
			const jwt = account.accessToken;
			if (!jwt) {
				return;
			}
			ws.send({
				type: "Auth",
				jwt,
			});
		} catch {
			console.info("Unauthorized");
		}
	}

	function publishLogout() {
		ws.send({
			type: "Logout",
		});
	}

	function publishGetMode(): void {
		const board = getBoard();
		const boardId = board?.getBoardId();
		if (!boardId) {
			return;
		}
		ws.send({
			type: "GetMode",
			boardId,
		});
	}

	function publishBoardEvent(
		boardId: string,
		event: SyncEvent,
		sequenceNumber: number,
	): void {
		const message: BoardEventMsg = {
			type: "BoardEvent",
			boardId,
			event,
			sequenceNumber,
		};

		ws.send(message);
	}

	function publishPresenceEvent(
		boardId: string,
		event: PresenceEventType,
	): void {
		const messageId = generateMessageId();

		const storage = getStorage();
		const generatedClientId = storage.getUser()
			? storage.getUser()!
			: storage.setUser();
		const account = getAccount();
		const generatedNickname = account.isLoggedIn
			? account.info?.name || account.info?.email || "Wild Cat"
			: "Anonymous";
		const generatedColor =
			storage.getUserColor() ||
			getBoard().presence.generateUserColor(false);
		const message: PresenceEventMsg = {
			type: "PresenceEvent",
			boardId,
			event,
			messageId,
			userId: generatedClientId,
			hardId: storage.getUserId(),
			softId: storage.getUser(),
			nickname: generatedNickname,
			color: generatedColor,
			avatar: account.info?.avatar || null,
		};

		ws.send(message);
	}

	function generateMessageId(): string {
		return Date.now().toString(36) + Math.random().toString(36).substr(2);
	}

	function publishSnapshot(boardId: string, snapshot: BoardSnapshot): void {
		ws.send({
			type: "BoardSnapshot",
			boardId,
			snapshot,
			lastEventOrder: snapshot.lastIndex,
		});
	}

	let connectionId = 0;
	const userId = 0;

	const connection: Connection = {
		get connectionId() {
			return connectionId;
		},
		publishGetMode,
		userId,
		connect,
		subscribe,
		unsubscribe,
		publishBoardEvent,
		publishPresenceEvent,
		publishSnapshot,
		wsClient: ws,
		publishAuth,
		publishLogout,
		onMessage: undefined,
	};

	return connection;
}

interface WsClient {
	onOpenSubject: Subject<unknown>;
	onCloseSubject: Subject<unknown>;
	connect: () => void;
	send: (message: SocketMsg) => void;
	isConnected: () => boolean;
	onAccessDenied: (boardId: string, forceUpdate?: boolean) => void;
	onConnect: () => void;
}

type SocketMsgHandler = (message: SocketMsg) => void;

function postConnectingMsg(): void {
	window.parent.postMessage(
		{
			pattern: "connectionState",
			payload: "connecting",
		},
		"*",
	);
}

function postConnectedMsg(): void {
	window.parent.postMessage(
		{
			pattern: "connectionState",
			payload: "connected",
		},
		"*",
	);
}

function postDisconnectedMsg(): void {
	window.parent.postMessage(
		{
			pattern: "connectionState",
			payload: "disconnected",
		},
		"*",
	);
}

export function createWsClient(
	msgHandler: SocketMsgHandler,
	setConnectionErrorTimeout: () => void,
	onError: (error: unknown) => void,
): WsClient {
	let socket: WebSocket | null;
	const onOpenSubject = new Subject();
	const onCloseSubject = new Subject();
	const socketUrl = getWebsocketUrl();

	function connect(): void {
		socket = new WebSocket(socketUrl);
		socket.onmessage = onMessage;
		socket.onopen = onOpen;
		socket.onclose = onClose;
		socket.onerror = onError;
	}

	let onAccessDenied = (boardId: string): void => {
		console.error("Not implemented. Access denied to board:", boardId);
	};

	let onConnect = (): void => {
		console.error("onConnect callback not implemented.");
	};

	function onMessage(event: MessageEvent<SocketMsg>): void {
		try {
			const json = JSON.parse(event.data as unknown as string);
			if (json && json.type === "Error") {
				throw new Error(
					"Error received: " +
						json.message +
						(json.deniedBoardId &&
							`. deniedBoardId: ${json.deniedBoardId}`),
				);
			}
			msgHandler(json);
		} catch (error) {
			console.warn(error);
			if (
				error instanceof Error &&
				error.message.includes("Access denied")
			) {
				const match = error.message.match(/deniedBoardId: (\S+)/);
				if (match) {
					const deniedBoardId = match[1];
					if (deniedBoardId !== "blank") {
						onAccessDenied(deniedBoardId);
						window.parent.postMessage(
							{
								pattern: "access-denied",
								payload: deniedBoardId,
							},
							"*",
						);
					}
				}
			}
		}
	}

	function send(message): void {
		if (socket && isConnected()) {
			socket.send(JSON.stringify(message));
		}
	}

	function isConnected(): boolean {
		return socket ? socket.readyState === WebSocket.OPEN : false;
	}

	function onOpen(): void {
		onOpenSubject.publish({});
	}

	function onClose(): void {
		onCloseSubject.publish({});
		setTimeout(() => {
			connect();
		}, WS_RECONNECT_TIMEOUT);
	}

	const pingMsg = JSON.stringify({ type: "ping" });

	function keepAlivePing(): void {
		if (isConnected()) {
			socket?.send(pingMsg);

			setConnectionErrorTimeout();
		}
	}

	setInterval(keepAlivePing, WS_PING_INTERVAL);

	connect();

	return {
		onOpenSubject,
		onCloseSubject,
		connect,
		send,
		isConnected,
		get onAccessDenied() {
			return onAccessDenied;
		},
		set onAccessDenied(
			handler: (boardId: string, forceUpdate?: boolean) => void,
		) {
			onAccessDenied = handler;
		},
		get onConnect() {
			return onConnect;
		},
		set onConnect(handler: () => void) {
			onConnect = handler;
		},
	};
}
