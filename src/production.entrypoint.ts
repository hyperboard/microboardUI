import { textInit } from "TextInit";
textInit();

import { createApp } from "App/App";
import "./index.css";

declare global {
	interface Window {
		showDebug: boolean;
	}
}
// eslint-disable-next-line no-var
var showDebug = false;
window.showDebug = showDebug;

const app = createApp();
app.connection.connect().then(() => {
	app.render();
});
