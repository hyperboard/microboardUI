import { Stream } from "Stream";
import { Subscription } from "./Subscription";
import { SocketMessage, SubscribeSM, UnsubscribeSM } from "../SocketMessage";
import { websocketClient as client } from "../WebsocketClient";

export class WebSocketSubscription implements Subscription {
	private boardId = "0";
	private subject = new Stream<SocketMessage>();
	private subscribeSm: SubscribeSM | undefined;
	client = client;

	subscribe(
		boardId: string,
		offset: number,
		subject: Stream<SocketMessage>,
	): this {
		this.boardId = boardId;
		this.subject = subject;
		this.subscribeSm = new SubscribeSM(boardId, offset);
		client.streams.subscribe(this.boardId, this.onMessage);
		client.onOpenSubject.subscribe(this.onOpen);
		return this;
	}

	unsubscribe(): this {
		client.streams.unsubscribe(this.boardId, this.onMessage);
		client.onOpenSubject.unsubscribe(this.onOpen);
		client.send(new UnsubscribeSM(this.boardId));
		return this;
	}

	onMessage = (event: SocketMessage): void => {
		this.subject.publish(event);
	};

	onOpen = (): void => {
		if (this.subscribeSm) {
			client.send(this.subscribeSm);
		}
	};
}
