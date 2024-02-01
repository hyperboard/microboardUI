import { Stream } from "Stream";
import { Publisher } from "./Publisher";
import { Subscription } from "./Subscription";
import { asyncGet, asyncPost } from "./HttpUtils";
import { BoardEventSM, SocketMessage } from "./SocketMessage";
import { BoardEvent } from "../Board/Events/Events";

export class Connection {
	/** Unique identifier for this connection */
	connectionId = 0;
	/** Unique identifier for the user */
	userId = 0;

	private subjects = new Map<string, Stream<SocketMessage>>();
	private publisher = this.getPublisher();

	constructor(
		private getPublisher: () => Publisher,
		private getSubscription: (
			boardId: string,
			offset: number,
			stream: Stream<SocketMessage>,
		) => Subscription,
	) {}

	/**
	 * Establish a connection with the server.
	 * This will set the connectionId and userId properties.
	 */
	async connect(): Promise<void> {
		try {
			const response = await asyncGet("/connection");
			if (!response.ok) {
				throw new Error("response not OK");
			}
			const data = await response.json();
			this.connectionId = data.connection;
		} catch (error) {
			console.error("Error Establishing Connection:", error);
		}
	}

	async getNewPublicBoardURL(): Promise<string | undefined> {
		try {
			const response = await asyncPost("/boards");
			if (!response.ok) {
				throw new Error("response not OK");
			}
			const data = await response.json();
			return data.board;
		} catch (error) {
			console.error("Error Establishing Connection:", error);
		}
		return undefined;
	}

	private getSubject(boardId: string): Stream<SocketMessage> {
		let subject = this.subjects.get(boardId);
		if (!subject) {
			subject = new Stream<SocketMessage>();
			this.subjects.set(boardId, subject);
		}
		this.getSubscription(boardId, 0, subject);
		return subject;
	}

	/** Subscribe to recive all events for a board strarting from the 1 based index */
	subscribe(
		boardId: string,
		callback: (serverMessage: SocketMessage) => void,
	): void {
		const subject = this.getSubject(boardId);
		subject.subscribe(callback);
	}

	/** Unsubscribe to stop reciving events */
	unsubscribe(
		boardId: string,
		callback: (serverMessage: SocketMessage) => void,
	): void {
		const subject = this.getSubject(boardId);
		subject.unsubscribe(callback);
	}

	/** Publish a board event */
	publishBoardEvent(boardId: string, event: BoardEvent): void {
		const message = new BoardEventSM(boardId, event);
		this.publisher.publish(boardId, message);
	}
}
