import { Stream } from "Stream";
import { Subscription } from "./Subscription";
import { SocketMessage } from "../SocketMessage";

export class MockSubscription implements Subscription {
	boardId: string | undefined;
	subject: Stream<SocketMessage> | undefined;

	subscribe(
		boardId: string,
		offset: number,
		subject: Stream<SocketMessage>,
	): this {
		this.boardId = boardId;
		this.subject = subject;
		return this;
	}

	unsubscribe(): this {
		return this;
	}
}
