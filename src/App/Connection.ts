import toast from "react-hot-toast";
import i18next from "i18next";
import { notify } from "View/Ui/Toast";
import { getApiUrl } from "Config";
import { getWebsocketUrl } from "../Config";
import { Subject } from "Subject";
import { Board, BoardSnapshot } from "Board/Board";
import { SyncBoardEvent, SyncEvent } from "Board/Events/Events";
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

export interface BoardEventMsg {
	type: "BoardEvent";
	boardId: string;
	// event: BoardEvent | BoardEventPack;
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
	// events: BoardEvent[];
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

export type ViewMode = "view" | "edit";

export interface ModeMsg {
	type: "Mode";
	boardId: string;
	mode: ViewMode;
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

export type PresenceEventType =
	| PointerMoveEvent
	| SelectionEvent
	| SetUserColorEvent
	| DrawSelectEvent
	| CancelDrawSelectEvent
	| CameraEvent;

export interface UserJoinMsg {
	type: "UserJoin";
	timestamp: number;
	userId: number;
	boardId: string;
	events: PresenceEventMsg<PresenceEventType>[];
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
	| ConfirmationMsg
	| BoardSubscriptionCompletedMsg
	| PresenceEventMsg;

export type SocketMsg =
	| EventsMsg
	| AuthMsg
	| UserJoinMsg
	| SubscribeMsg
	| UnsubscribeMsg
	| ErrorMsg
	| ModeMsg
	| PingMsg;

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
		// event: BoardEventPack,
		event: SyncEvent,
		sequenceNumber: number,
	): void;
	publishPresenceEvent(boardId: string, event: PresenceEventType): void;
	publishAuth(jwt: string): void;
	publishSnapshot(boardId: string, snapshot: BoardSnapshot): void;
	wsClient: WsClient;
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
	let pingTimeout: NodeJS.Timeout | null = null;
	let pingNotificationId: string | null = null;
	let changedViewMode = false;

	const onConnectionLost = (): void => {
		const notificationId = getBoard().events?.getNotificationId();
		if (notificationId) {
			toast.dismiss(notificationId);
		}
		if (!pingNotificationId) {
			pingNotificationId = notify({
				header: i18next.t("notifications.connectionLostHeader"),
				variant: "black",
				duration: Infinity,
				unclosable: true,
				position: "bottom-center",
			});
		}
		const board = getBoard();
		if (board.getBoardId() !== "blank" && board.interfaceType !== "view") {
			board.selection.removeAll();
			board.interfaceType = "view";
			board.tools.navigate();
			changedViewMode = true;
			board.tools.publish();
		}
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
		pingTimeout = setTimeout(onConnectionLost, WS_PING_INTERVAL + 1);
	};

	const subscribeTimeouts = new Map<
		string,
		{ timeout: NodeJS.Timeout; time: number }
	>();

	function clearConnectionError(): void {
		getBoard().events?.removeBeforeUnloadListener();
		if (pingTimeout) {
			clearTimeout(pingTimeout);
			pingTimeout = null;
		}
		if (pingNotificationId) {
			toast.dismiss(pingNotificationId);
			pingNotificationId = null;
			notify({
				header: i18next.t("notifications.connectionReestablished"),
				variant: "black",
				position: "bottom-center",
				unclosable: true,
			});
		}
		if (changedViewMode) {
			getBoard().interfaceType = "edit";
			changedViewMode = false;
			getBoard().tools.publish();
		}
	}

	function onMessage(msg: SocketMsg): void {
		const board = getBoard();
		clearConnectionError();
		switch (msg.type) {
			case "SubscribeConfirmation":
			case "Confirmation":
			case "BoardEvent":
			case "BoardEventList":
			case "BoardSnapshot":
			case "Mode":
			case "CreateSnapshotRequest":
			case "BoardSubscriptionCompleted":
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
			case "UserJoin":
				if (board) {
					board.presence.join(msg);
				}
				break;
			case "PresenceEvent":
				if (board) {
					board.presence.push(msg);
				}
				break;
			case "Subscribe":
			case "Unsubscribe":
			case "Error":
			case "ping":
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

		function sendSubscribeMsg(): void {
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

	function publishAuth(jwt: string): void {
		ws.send({
			type: "Auth",
			jwt,
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
			: "Анонимный пользователь";
		const generatedColor =
			storage.getUserColor() ||
			getBoard().presence.generateUserColor(false);
		const message: PresenceEventMsg = {
			type: "PresenceEvent",
			boardId,
			event,
			messageId,
			userId: generatedClientId,
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

	return {
		get connectionId() {
			return connectionId;
		},
		userId,
		connect,
		subscribe,
		unsubscribe,
		publishBoardEvent,
		publishPresenceEvent,
		publishSnapshot,
		wsClient: ws,
		publishAuth,
	};
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
						(json.denidedBoardId &&
							`. deniedBoardId: ${json.denidedBoardId}`),
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
