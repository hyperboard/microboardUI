/* eslint-disable no-var */
// import { textInit } from "TextInit";
// textInit();

import { createApp } from "App/App";
import "./index.css";
import { initBrowserSettings } from "Board/api/initBrowserSettings";
import "features/Cursors";

declare global {
	interface Window {
		showDebug: boolean;
		enableTemplateCreating: boolean;
		enableVideos: boolean;
		enableLogger: () => void;
		disableLogger: () => void;
	}
}

initBrowserSettings();
// var showDebug = isMicroboard() ? true : false;
window.showDebug = false;
window.enableTemplateCreating = false;
window.enableDiagrams = false;
window.enableVideos = true;

const app = createApp();

window.enableLogger = app.enableLogger;
window.disableLogger = app.disableLogger;

app.account.init().finally(() => {
	app.connection.connect().then(() => {
		app.render();
	});
});
