import { Stream, Streams } from "../Stream";
import { SocketMessage } from "./SocketMessage";
import { getWebsocketUrl } from "../Config";

export class WebsocketClient {
	private socket: WebSocket | undefined;
	readonly streams = new Streams<SocketMessage>();
	readonly onOpenSubject = new Stream<void>();
	readonly onCloseSubject = new Stream<void>();
	static isAvailable(): boolean {
		return typeof WebSocket !== "undefined";
	}

	constructor(private timeoutReconnect: number = 5000) {
		this.connect();
		setInterval(() => {
			if (this.isConnected()) {
				this.socket?.send(JSON.stringify({ type: "ping" }));
			}
		}, 30000);
	}

	connect(): void {
		this.socket = new WebSocket(getWebsocketUrl());
		this.socket.onmessage = this.onMessage;
		this.socket.onopen = this.onOpen;
		this.socket.onclose = this.onClose;
		this.socket.onerror = this.onError;
	}

	send(message: SocketMessage): void {
		const socket = this.socket;
		if (socket && this.isConnected) {
			socket.send(JSON.stringify(message));
		}
	}

	isConnected(): boolean {
		const socket = this.socket;
		return !!socket && socket.readyState === WebSocket.OPEN;
	}

	private onMessage = (event: MessageEvent): void => {
		const message = JSON.parse(event.data);
		this.streams.publish(message.boardId, message);
	};

	private onOpen = (): void => {
		this.onOpenSubject.publish();
	};

	private onClose = (): void => {
		this.onCloseSubject.publish();
		setTimeout(() => {
			this.connect();
		}, this.timeoutReconnect);
	};

	private onError = (event: Event): void => {
		console.error("WebsocketClient: error", event);
	};
}

export const websocketClient = new WebsocketClient();
