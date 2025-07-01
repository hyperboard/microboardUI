/* eslint-disable no-var */
// import { textInit } from "TextInit";
// textInit();
import { App, createApp } from "App/App";
import "features/Cursors";
import { initInter } from "initI18N";
import "./index.css";

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

async function initializeApp() {
	await initInter();
	window.app = createApp();
	window.enableLogger = window.app.enableLogger;
	window.disableLogger = window.app.disableLogger;

	window.app.account.init().finally(() => {
		window.app.connection.connect().then(() => {
			window.app.render();
		});
	});
}

initializeApp();
