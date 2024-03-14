import { createApp } from "App/App";

const app = createApp();
app.connection
	.connect()
	.then(() => {
		return app.openStartingBoard();
	})
	.then(() => {
		app.render();
	});
