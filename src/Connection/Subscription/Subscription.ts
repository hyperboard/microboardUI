import { Stream } from "Stream";
import { SocketMessage } from "../SocketMessage";

/**
 * Subscription interface. Subscribes to events from the server and publishes them to the subject.
 */
export interface Subscription {
	/**
	 * Subscribe to events from the server.
	 * @param boardId the board to subscribe to
	 * @param offset the offset to start events from
	 * @param subject the subject to publish events to
	 */
	subscribe(
		boardId: string,
		offset: number,
		subject: Stream<SocketMessage>,
	): this;

	/**
	 * Unsubscribe from events from the server.
	 */
	unsubscribe(): this;
}
