import { WebsocketServer } from "./WebsocketServer";

export function getWebSocketServer(): WebsocketServer {
	return new WebsocketServer();
}
