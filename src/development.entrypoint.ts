/* eslint-disable no-var */

import { App, createApp, initInter } from "microboard-ui-temp";
import "microboard-ui-temp/styles.css";
import "features/Cursors";

declare global {
	interface Window {
		app: App;
		showDebug: boolean;
		enableTemplateCreating: boolean;
		enableVideos: boolean;
		enableGames: boolean;
		enableAI: boolean;
		enableDiagrams: boolean;
		showOpenFilePicker: () => Promise<FileSystemFileHandle[]>; // should be there
	}
}

var showDebug = true;
window.showDebug = showDebug;
window.enableTemplateCreating = false;
window.enableDiagrams = true;
window.enableVideos = true;
window.enableGames = true;
window.enableAI = false;

async function initializeApp() {
	await initInter();
	const app = createApp();
	app.account.init().finally(() => {
		app.connection.connect().then(() => {
			app.render();
		});
	});
	window.app = app;
}

initializeApp();
