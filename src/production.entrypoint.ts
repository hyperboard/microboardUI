/* eslint-disable no-var */
import { App, createApp, initInter } from "microboard-ui-temp";
import { customCursors } from "microboard-ui-temp";
console.log("prevent shake", customCursors);
import "microboard-ui-temp/styles.css";
// import "features/Cursors";
// import "./index.css";

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
