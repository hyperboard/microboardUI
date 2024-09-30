import { getApiUrl } from "Config";
import { getWebsocketUrl } from "../Config";
import { Subject } from "Subject";
import { BoardSnapshot } from "Board/Board";

const WS_RECONNECT_TIMEOUT = 5000;
const WS_PING_INTERVAL = 30000;

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
	snapshot: BoardSnapshot; // This could be strongly typed
	lastEventOrder: number;
}

interface ViewMode {
	type: "ViewMode";
	boardId: string;
}

export type SocketMessage =
	| Auth
	| BoardEvent
	| BoardEventList
	| Subscribe
	| Unsubscribe
	| Error
	| ViewMode
	| SnapshotRequest
	| SnapshotResponse;

export interface Connection {
	connectionId: number;
	userId: number;
	connect(): Promise<void>;
	subscribe(
		boardId: string,
		callback: (serverMessage: SocketMessage) => void,
	): void;
	unsubscribe(
		boardId: string,
		callback: (serverMessage: SocketMessage) => void,
	): void;
	publishBoardEvent(boardId: string, event: BoardEvent): void;
	publishSnapshot(boardId: string, snapshot: BoardSnapshot): void;
	wsClient: WsClient;
}

interface Subscription {
	publish: (message: SocketMessage) => void;
	subscribe: () => void;
	unsubscribe: () => void;
}

export function createConnection(): Connection {
	const subscriptions = new Map<string, Subscription>();
	function onMessage(msg: SocketMessage): void {
		if (msg.type === "Auth" || msg.type === "Error") {
			return;
		}
		const subscription = subscriptions.get(msg.boardId);
		if (!subscription) {
			return;
		}
		subscription.publish(msg);
	}
	const ws = createWsClient(onMessage);

	async function connect(): Promise<void> {
		try {
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
			console.error("Error Establishing Connection:", error);
			window.parent.postMessage(
				{
					pattern: "MicroboardError",
					payload: JSON.stringify({ error }),
				},
				"*",
			);
			window.parent.postMessage(
				{
					pattern: "connectionState",
					payload: "disconnected",
				},
				"*",
			);
		}
	}

	function subscribe(
		boardId: string,
		callback: (serverMessage: any) => void,
	): void {
		const subject = subscriptions.get(boardId);
		if (subject) {
			return;
		}

		const offset = 0;
		const onOpen = (): void => {
			ws.send({
				type: "Subscribe",
				boardId,
				index: offset,
			});
		};

		const subscribe = (): void => {
			ws.onOpenSubject.subscribe(onOpen);
			window.parent.postMessage(
				{
					pattern: "connectionState",
					payload: "connecting",
				},
				"*",
			);
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

	function publishBoardEvent(boardId: string, event: BoardEvent): void {
		ws.send({
			type: "BoardEvent",
			boardId,
			event,
		});
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
	};
}

interface WsClient {
	onOpenSubject: Subject<unknown>;
	onCloseSubject: Subject<unknown>;
	connect: () => void;
	send: (message: SocketMessage) => void;
	isConnected: () => boolean;
	onAccessDenied: (boardId: string, forceUpdate?: boolean) => void;
}

type SocketMsgHandler = (message: SocketMessage) => void;

export function createWsClient(msgHandler: SocketMsgHandler): WsClient {
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

	function onMessage(event: MessageEvent<SocketMessage>): void {
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
		return (socket && socket.readyState === WebSocket.OPEN) || false;
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

	function onError(event): void {
		console.error("WebsocketClient: error", event);
		window.parent.postMessage(
			{
				pattern: "MicroboardError",
				payload: JSON.stringify({
					error: `WebsocketClient: error ${event}`,
				}),
			},
			"*",
		);
	}

	const pingMsg = JSON.stringify({ type: "ping" });

	function keepAlivePing(): void {
		if (isConnected()) {
			socket?.send(pingMsg);
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
	};
}
