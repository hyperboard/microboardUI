import { getExpressApp } from "./Server/getExpressApp";
import { getServer } from "./Server/getServer";
import { getWebSocketServer } from "./Server/WebSocket";

const websocketServer = getWebSocketServer();

getExpressApp(websocketServer).then(app => {
    websocketServer.init(getServer(app)).listen(process.env.PORT, () => {
        console.log("API is running at http://localhost:" + process.env.PORT);
    });
});
