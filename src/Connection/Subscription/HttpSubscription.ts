import { Stream } from "Stream";
import { Subscription } from "./Subscription";
import { asyncGet } from "../HttpUtils";
import { BoardEvent } from "../../Board/Events/Events";
import { BoardEventSM, SocketMessage } from "../SocketMessage";

/**
 * Http polling subscription. Polls events from the server and publishes them to the subject.
 */
export class HttpSubscription implements Subscription {
	private index = 1;
	private intervalId: NodeJS.Timer | undefined;
	private boardId = "0";
	private subject = new Stream<SocketMessage>();

	subscribe(
		boardId = "0",
		offset: number,
		subject = new Stream<SocketMessage>(),
		interval = 5000,
	): this {
		this.boardId = boardId;
		this.subject = subject;
		this.index = offset;
		this.intervalId = setInterval(() => {
			this.requestEvents();
		}, interval);
		this.requestEvents();
		return this;
	}

	unsubscribe(): this {
		if (this.intervalId) {
			clearInterval(this.intervalId);
		}
		return this;
	}

	private requestEvents = (): void => {
		asyncGet(`/boards/${this.boardId}/events/${this.index}`)
			.then<{ events: BoardEvent[] }>(this.parseResponse)
			.then(this.readEvents)
			.catch(this.handleNetworkError);
	};

	private parseResponse = (
		response: Response,
	): Promise<{ events: BoardEvent[] }> => {
		if (!response.ok) {
			throw new Error(
				`response not OK: ${JSON.stringify(response, null, 4)}`,
			);
		}
		return response.json();
	};

	private readEvents = (data: { events: BoardEvent[] }): void => {
		if (!data.events) {
			throw new Error(
				`response data invalid: ${JSON.stringify(data, null, 4)}`,
			);
		}
		for (const event of data.events) {
			if (event.order > this.index) {
				this.index = event.order;
			}
			this.subject.publish(new BoardEventSM(this.boardId, event));
		}
	};

	private handleNetworkError = (error: Error): void => {
		console.error("GET events network error", error);
	};
}
