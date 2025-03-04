/* eslint-disable no-var */
// import { textInit } from "TextInit";
// textInit();

import { createApp } from "App/App";
import "./index.css";

declare global {
	interface Window {
		showDebug: boolean;
		enableTemplateCreating: boolean;
		enableLogger: () => void;
		disableLogger: () => void;
	}
}

// var showDebug = isMicroboard() ? true : false;
window.showDebug = false;
window.enableTemplateCreating = false;
window.enableDiagrams = false;

const app = createApp();

window.enableLogger = app.enableLogger;
window.disableLogger = app.disableLogger;

app.account.init().finally(() => {
	app.connection.connect().then(() => {
		app.render();
	});
});
