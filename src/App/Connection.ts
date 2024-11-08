import toast from "react-hot-toast";
import i18next from "i18next";
import { notify } from "View/Ui/Toast";
import { getApiUrl } from "Config";
import { getWebsocketUrl } from "../Config";
import { Subject } from "Subject";
import { Board, BoardSnapshot } from "Board/Board";
import {
	BoardEvent,
	BoardEventPack,
	SyncBoardEvent,
	SyncEvent,
} from "Board/Events/Events";

const WS_RECONNECT_TIMEOUT = 5000;
const WS_PING_INTERVAL = 30000;

export interface AuthMsg {
	type: "Auth";
	jwt: string;
}

export interface BoardEventMsg {
	type: "BoardEvent";
	boardId: string;
	// event: BoardEvent | BoardEventPack;
	event: SyncEvent;
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
	// events: BoardEvent[];
	events: SyncBoardEvent[];
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
	snapshot: BoardSnapshot;
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
	| SubscribeConfirmationMsg
	| ConfirmationMsg;

export type SocketMsg =
	| EventsMsg
	| AuthMsg
	| SubscribeMsg
	| UnsubscribeMsg
	| ErrorMsg
	| ViewModeMsg
	| PingMsg;

export interface Connection {
	connectionId: number;
	userId: number;
	connect(): Promise<void>;
	subscribe(
		boardId: string,
		callback: (serverMessage: EventsMsg) => void,
		lastOrder: number,
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
	publishAuth(jwt: string): void;
	publishSnapshot(boardId: string, snapshot: BoardSnapshot): void;
	wsClient: WsClient;
}

interface Subscription {
	publish: (message: EventsMsg) => void;
	subscribe: () => void;
	unsubscribe: () => void;
}

export function createConnection(getBoard: () => Board): Connection {
	const subscriptions = new Map<string, Subscription>();
	let pingTimeout: NodeJS.Timeout | null = null;
	let pingNotificationId: string | null = null;
	let changedViewMode = false;

	// const beforeUnloadListener = (event: BeforeUnloadEvent): void => {
	// 	event.preventDefault();
	// 	event.returnValue = "Do not leave the page to avoid losing data";
	// };

	const onConnectionLost = (): void => {
		if (!pingNotificationId) {
			pingNotificationId = notify({
				header: i18next.t("notifications.connectionLostHeader"),
				variant: "black",
				duration: Infinity,
				unclosable: true,
				position: "bottom-center",
			});
			// window.addEventListener('beforeunload', beforeUnloadListener);
		}
		const board = getBoard();
		if (board.getBoardId() !== "blank" && board.interfaceType !== "view") {
			board.selection.removeAll();
			board.interfaceType = "view";
			board.tools.navigate();
			changedViewMode = true;
			board.tools.publish();
		}
		window.parent.postMessage(
			{
				pattern: "connectionState",
				payload: "disconnected",
			},
			"*",
		);
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
		pingTimeout = setTimeout(onConnectionLost, WS_PING_INTERVAL);
	};

	function clearConnectionError(): void {
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
			// window.removeEventListener('beforeunload', beforeUnloadListener);
		}
		if (changedViewMode) {
			getBoard().interfaceType = "edit";
			changedViewMode = false;
			getBoard().tools.publish();
		}
	}

	function onMessage(msg: SocketMsg): void {
		clearConnectionError();
		switch (msg.type) {
			case "SubscribeConfirmation":
			case "Confirmation":
			case "BoardEvent":
			case "BoardEventList":
			case "BoardSnapshot":
			case "ViewMode":
			case "CreateSnapshotRequest":
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
				break;
			default:
				console.warn("Debug: Received unknown message type:", msg.type);
		}
	}
	const ws = createWsClient(onMessage, setConnectionErrorTimeout, onErorr);

	async function connect(): Promise<void> {
		try {
			window.parent.postMessage(
				{
					pattern: "connectionState",
					payload: "connecting",
				},
				"*",
			);
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
			window.parent.postMessage(
				{
					pattern: "connectionState",
					payload: "connected",
				},
				"*",
			);
			const data = await response.json();
			connectionId = data.connection;
		} catch (error) {
			onErorr(error);
		}
	}

	function subscribe(
		boardId: string,
		callback: (serverMessage: EventsMsg) => void,
		lastOrder: number,
	): void {
		const subject = subscriptions.get(boardId);
		if (subject) {
			return;
		}

		const offset = lastOrder;
		const onOpen = (): void => {
			ws.send({
				type: "Subscribe",
				boardId,
				index: offset,
			});
		};

		const subscribe = (): void => {
			ws.onOpenSubject.subscribe(onOpen);
			onOpen();
		};

		const unsubscribe = (): void => {
			ws.onOpenSubject.unsubscribe(onOpen);
			ws.send({ type: "Unsubscribe", boardId: boardId });
			window.parent.postMessage(
				{
					pattern: "connectionState",
					payload: "disconnected",
				},
				"*",
			);
		};

		subscribe();

		subscriptions.set(boardId, {
			publish: callback,
			subscribe,
			unsubscribe,
		});
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
		const messageId = generateMessageId();

		const message: BoardEventMsg = {
			type: "BoardEvent",
			boardId,
			event,
			messageId,
			sequenceNumber,
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
