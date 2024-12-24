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
		showOpenFilePicker: () => Promise<FileSystemFileHandle[]>; // undefined by itself ??
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

window.useHTTPSubscription = false;
