/* eslint-disable no-var */

import { App } from "App";
import { createApp } from "App/App";
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
		enableDiagrams: boolean;
		showOpenFilePicker: (opts?: any) => Promise<FileSystemFileHandle[]>; // should be there
	}
}

var showDebug = true;
window.showDebug = showDebug;
window.enableTemplateCreating = false;
window.enableDiagrams = true;
window.enableVideos = true;
window.enableGames = true;

async function initializeApp() {
	await initInter();
	window.app = createApp();
	window.app.account.init().finally(() => {
		window.app.connection.connect().then(() => {
			window.app.render();
		});
	});
}

initializeApp();
