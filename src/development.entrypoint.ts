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
		const boards = window.app.storage.listPublicBoards();
		return boards.length === 0 ? window.app.openStartingBoard() : Promise.resolve();
	})
	.then(() => {
		window.app.render();
	});

window.useHTTPSubscription = false;
