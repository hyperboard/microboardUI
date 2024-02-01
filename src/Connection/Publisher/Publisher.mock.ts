import { MockSubscription } from "Connection/Subscription/";
import { SocketMessage } from "../SocketMessage";
import { Publisher } from "./Publisher";

/**
 * Mock publisher that stores events in memory
 */
export class MockPublisher implements Publisher {
	private events: { [boardId: string]: SocketMessage[] } = {};
	private subscriptions: { [boardId: string]: MockSubscription } = {};

	publish = (boardId: string, message: SocketMessage): void => {
		let events = this.events[boardId];
		if (!events) {
			this.events[boardId] = [];
			events = this.events[boardId];
		}

		switch (message.type) {
			case "BoardEvent": {
				message.event.order = events.length;
				break;
			}
		}
		events.push(message);
		const subscription = this.subscriptions[boardId];
		subscription?.subject?.publish(message);
	};

	addSubscription = (
		boardId: string,
		subscription: MockSubscription,
	): void => {
		this.subscriptions[boardId] = subscription;
		for (const event of this.events[boardId] || []) {
			subscription.subject?.publish(event);
		}
	};
}
