import { App } from "App";
import { createApp } from "App/App";
import "./index.css";

declare global {
	interface Window {
		app: App;
		useHTTPSubscription: boolean;
	}
}

window.app = createApp();
window.app.connection.connect().then(() => {
	window.app.render();
});

window.useHTTPSubscription = false;
