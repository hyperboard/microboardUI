import { createApp } from "App/App";
import "./index.css";

const app = createApp();
app.connection
	.connect()
	.then(() => {
		return app.openStartingBoard();
	})
	.then(() => {
		app.render();
	});
