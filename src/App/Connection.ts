import { BoardEvent } from "../Board/Events/Events";
import { getApiUrl } from "Config";
import { Stream, Streams } from "../Stream";
import { getWebsocketUrl } from "../Config";
import { Subject } from "Subject";

export class Connection {
	/** Unique identifier for this connection */
	connectionId = 0;
	/** Unique identifier for the user */
	userId = 0;

	private subjects = new Map<string, Stream<any>>();
	private ws = createWebsocketClient();

	/**
	 * Establish a connection with the server.
	 * This will set the connectionId and userId properties.
	 */
	async connect(): Promise<void> {
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
			const data = await response.json();
			this.connectionId = data.connection;
		} catch (error) {
			console.error("Error Establishing Connection:", error);
		}
	}

	private getSubject(boardId: string): Stream<any> {
		let subject = this.subjects.get(boardId);
		if (!subject) {
			subject = new Stream<any>();
			this.subjects.set(boardId, subject);
		}
		const subscription = getSubscription(this.ws, boardId, 0, subject);
		subscription.subscribe();
		return subject;
	}

	/** Subscribe to recive all events for a board strarting from the 1 based index */
	subscribe(boardId: string, callback: (serverMessage: any) => void): void {
		const subject = this.getSubject(boardId);
		subject.subscribe(callback);
	}

	/** Unsubscribe to stop reciving events */
	unsubscribe(boardId: string, callback: (serverMessage: any) => void): void {
		const subject = this.getSubject(boardId);
		subject.unsubscribe(callback);
	}

	/** Publish a board event */
	publishBoardEvent(boardId: string, event: BoardEvent): void {
		this.ws.send({
			type: "BoardEvent",
			boardId,
			event,
		});
	}
}

export function createWebsocketClient(timeoutReconnect = 5000) {
	let socket;
	const streams = new Streams();
	const onOpenSubject = new Subject();
	const onCloseSubject = new Subject();

	// Establish and manage the WebSocket connection
	const connect = () => {
		socket = new WebSocket(getWebsocketUrl());
		socket.onmessage = onMessage;
		socket.onopen = onOpen;
		socket.onclose = onClose;
		socket.onerror = onError;
	};

	// Send a message over the WebSocket
	const send = message => {
		if (socket && isConnected()) {
			socket.send(JSON.stringify(message));
		}
	};

	// Check if the WebSocket is connected
	const isConnected = () => {
		return socket && socket.readyState === WebSocket.OPEN;
	};

	// Handler for incoming WebSocket messages
	const onMessage = event => {
		const message = JSON.parse(event.data);
		streams.publish(message.boardId, message);
	};

	// Handler for a successful WebSocket connection
	const onOpen = () => {
		onOpenSubject.publish();
	};

	// Handler for WebSocket disconnections
	const onClose = () => {
		onCloseSubject.publish();
		setTimeout(() => {
			connect();
		}, timeoutReconnect);
	};

	// Handler for WebSocket errors
	const onError = event => {
		console.error("WebsocketClient: error", event);
	};

	// Set up a ping interval to keep the connection alive
	setInterval(() => {
		if (isConnected()) {
			socket?.send(JSON.stringify({ type: "ping" }));
		}
	}, 30000);

	// Start the connection upon creation
	connect();

	// Expose the necessary properties and methods
	return {
		streams,
		onOpenSubject,
		onCloseSubject,
		connect,
		send,
		isConnected,
	};
}

export function getSubscription(
	ws,
	boardId: string,
	offset: number,
	stream: Stream<any>,
) {
	// Function to handle messages received from the WebSocket
	const onMessage = (event: any): void => {
		try {
			const parsedEvent = JSON.parse(event.data);
			if (parsedEvent && parsedEvent.type === "Error") {
				throw new Error("Error received: " + parsedEvent.message);
			}
			stream.publish(parsedEvent);
		} catch (error) {
			if (error instanceof SyntaxError) {
				throw new Error("Invalid JSON:", event.data);
			} else {
				throw error;
			}
		}
	};

	// Function to handle when the WebSocket connection opens
	const onOpen = (): void => {
		ws.send({
			type: "Subscribe",
			boardId,
			index: offset,
		});
	};

	// Function to start the subscription
	const subscribe = (): void => {
		ws.streams.subscribe(boardId, onMessage);
		ws.onOpenSubject.subscribe(onOpen);
		onOpen();
	};

	// Function to end the subscription
	const unsubscribe = (): void => {
		ws.streams.unsubscribe(boardId, onMessage);
		ws.onOpenSubject.unsubscribe(onOpen);
		ws.send({ type: "Unsubscribe", boardId: boardId });
	};

	// Return an object with the subscription methods
	return {
		subscribe,
		unsubscribe,
	};
}
