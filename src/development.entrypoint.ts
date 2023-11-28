import { App } from "./App";
import { Connection } from "Connection";
import { getWebSocketOrHttpSubscription } from "Connection/Subscription";
import { getWebsocketOrHttpPublisher } from "./Connection/Publisher/getPublisher";

declare global {
	interface Window {
		app: App;
		useHTTPSubscription: boolean;
	}
}

const connection = new Connection(
	getWebsocketOrHttpPublisher,
	getWebSocketOrHttpSubscription,
);
connection
	.connect()
	.then(() => {
		window.app = new App(connection);
		return window.app.openStartingBoard();
	})
	.then(() => {
		window.app.render();
	});

window.useHTTPSubscription = false;
