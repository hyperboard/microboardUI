import { MockPublisher } from "Connection/Publisher";
import { Stream } from "Stream";
import { HttpSubscription } from "./HttpSubscription";
import { MockSubscription } from "./Subscription.mock";
import { WebSocketSubscription } from "./WebSocketSubscription";
import { SocketMessage } from "../SocketMessage";
import { WebsocketClient } from "../WebsocketClient";

export function getWebSocketOrHttpSubscription(
	boardId: string,
	offset: number,
	stream: Stream<SocketMessage>,
): HttpSubscription | WebSocketSubscription {
	if (!window.useHTTPSubscription && WebsocketClient.isAvailable()) {
		return new WebSocketSubscription().subscribe(boardId, offset, stream);
	} else {
		return new HttpSubscription().subscribe(boardId, offset, stream);
	}
}

export function getMockSubscription(
	publisher: MockPublisher,
): (boardId: string, stream: Stream<SocketMessage>) => MockSubscription {
	return function (
		boardId: string,
		stream: Stream<SocketMessage>,
	): MockSubscription {
		const subscription = new MockSubscription().subscribe(
			boardId,
			0,
			stream,
		);
		publisher.addSubscription(boardId, subscription);
		return subscription;
	};
}
