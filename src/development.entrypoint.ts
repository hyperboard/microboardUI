/* eslint-disable no-var */
import { initInter } from "initI18N";
initInter();

import { App } from "App";
import { createApp } from "App/App";
import "./index.css";
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

window.app = createApp();
window.app.account.init().finally(() => {
	window.app.connection.connect().then(() => {
		window.app.render();
	});
});
