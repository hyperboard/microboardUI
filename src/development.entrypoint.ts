/* eslint-disable no-var */

import { App, createApp, initInter } from "microboard-ui-temp";
import "microboard-ui-temp/style";
import "features/Cursors";

declare global {
	interface Window {
		app: App;
		showDebug: boolean;
		enableTemplateCreating: boolean;
		enableVideos: boolean;
		enableGames: boolean;
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
