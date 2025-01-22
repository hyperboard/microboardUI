/* eslint-disable no-var */
import { textInit } from "TextInit";
textInit();

import { createApp } from "App/App";
import "./index.css";
import { isMicroboard } from "lib/isMicroboard";

declare global {
	interface Window {
		showDebug: boolean;
		enableTemplateCreating: boolean;
	}
}

// var showDebug = isMicroboard() ? true : false;
window.showDebug = false;
window.enableTemplateCreating = false;
window.enableDiagrams = false;

const app = createApp();
app.connection.connect().then(() => {
	app.render();
});
