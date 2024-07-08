import { createApp } from "App/App";
import "./index.css";

const app = createApp();
app.connection.connect().then(() => {
	app.render();
});
