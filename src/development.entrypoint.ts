/* eslint-disable no-var */
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
		customTextRender: boolean;
		enableTemplateCreating: boolean;
		// todo remove when has ui
		exportHTML: () => string;
	}
}

var showDebug = isMicroboard() ? true : false;
window.showDebug = showDebug;
window.enableTemplateCreating = false;

var customTextRender = false;
window.customTextRender = customTextRender;

window.app = createApp();
window.app.connection.connect().then(() => {
	window.app.render();
});

function exportHTML(): string {
	return window.app.getBoard().exportHTML();
}
window.exportHTML = exportHTML;

window.useHTTPSubscription = false;
