import { App } from "./App/App";
import { Connection } from "Connection";
import { getWebSocketOrHttpSubscription } from "Connection/Subscription";
import { getWebsocketOrHttpPublisher } from "./Connection/Publisher/getPublisher";

let app: App | undefined;

const connection = new Connection(
	getWebsocketOrHttpPublisher,
	getWebSocketOrHttpSubscription,
);
connection
	.connect()
	.then(() => {
		app = new App(connection);
		return app.openStartingBoard();
	})
	.then(() => {
		app?.render();
	});
