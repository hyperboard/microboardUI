import { textInit } from "TextInit";
textInit();

import { App } from "App";
import { createApp } from "App/App";
import "./index.css";
import { isMicroboard } from "lib/isMicroboard";

declare global {
	interface Window {
		app: App;
		useHTTPSubscription: boolean;
		showDebug: boolean;
		enableTemplateCreating: boolean;
	}
}

// eslint-disable-next-line no-var
var showDebug = isMicroboard() ? true : false;
window.showDebug = showDebug;
window.enableTemplateCreating = false;

window.app = createApp();
window.app.connection.connect().then(() => {
	window.app.render();
});

window.useHTTPSubscription = false;
