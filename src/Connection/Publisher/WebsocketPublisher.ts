import { Publisher } from "./Publisher";
import { SocketMessage } from "../SocketMessage";
import { websocketClient } from "../WebsocketClient";

export class WebsocketPublisher implements Publisher {
	publish(boardId: string, message: SocketMessage): void {
		websocketClient.send(message);
	}
}
