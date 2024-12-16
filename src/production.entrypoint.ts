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
		// todo remove when has ui
		exportHTML: () => string;
	}
}

var showDebug = isMicroboard() ? true : false;
window.showDebug = showDebug;
window.enableTemplateCreating = false;

const app = createApp();
app.connection.connect().then(() => {
	app.render();
});

function exportHTML(): string {
	return app.getBoard().exportHTML();
}
window.exportHTML = exportHTML;
