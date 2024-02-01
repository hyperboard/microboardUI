import { getExpressApp } from "./getExpressApp";
import { getServer } from "./getServer";
import { getWebSocketServer } from "./WebSocket";

const websocketServer = getWebSocketServer();

getExpressApp(websocketServer).then(app => {
	websocketServer.init(getServer(app)).listen(process.env.PORT, () => {
		console.log("API is running at http://localhost:" + process.env.PORT);
	});
});
