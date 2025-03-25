/* eslint-disable no-var */
// import { textInit } from "TextInit";
// textInit();

import { initBrowserSettings } from "Board/api/initBrowserSettings";
initBrowserSettings();
import { App } from "App";
import { createApp } from "App/App";
import "./index.css";
import "features/Cursors";

declare global {
	interface Window {
		app: App;
		useHTTPSubscription: boolean;
		showDebug: boolean;
		enableTemplateCreating: boolean;
		enableVideos: boolean;
		enableDiagrams: boolean;
		enableSnapshots: boolean;
		showOpenFilePicker: () => Promise<FileSystemFileHandle[]>; // should be there
	}
}

var showDebug = true;
window.showDebug = showDebug;
window.enableTemplateCreating = false;
window.enableDiagrams = true;
window.enableVideos = true;
window.enableSnapshots = true;

window.app = createApp();
window.app.account.init().finally(() => {
	window.app.connection.connect().then(() => {
		window.app.render();
	});
});

window.useHTTPSubscription = false;
