/* eslint-disable no-var */
// import { textInit } from "TextInit";
// textInit();
import { initInter } from "initI18N";
initInter();

import { App, createApp } from "App/App";
import "./index.css";
import "features/Cursors";

declare global {
	interface Window {
		app: App;
		showDebug: boolean;
		enableTemplateCreating: boolean;
		enableVideos: boolean;
		enableGames: boolean;
		enableLogger: () => void;
		disableLogger: () => void;
	}
}

// var showDebug = isMicroboard() ? true : false;
window.showDebug = false;
window.enableTemplateCreating = false;
window.enableDiagrams = false;
window.enableVideos = true;
window.enableGames = false;

window.app = createApp();

window.enableLogger = window.app.enableLogger;
window.disableLogger = window.app.disableLogger;

window.app.account.init().finally(() => {
	window.app.connection.connect().then(() => {
		window.app.render();
	});
});
