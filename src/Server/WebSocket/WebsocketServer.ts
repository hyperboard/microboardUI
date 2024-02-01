import WebSocket, { WebSocketServer } from "ws";
import http from "http";
import { SocketMessage } from "Server/Message";
import { Stream } from "./Stream";

export class WebsocketServer {
    readonly streamMessages = new Stream<{
        client: WebSocket.WebSocket;
        socketMessage: SocketMessage;
    }>();
    readonly boardSubscribesClient = new Map<string, WebSocket.WebSocket[]>();

    init(server: http.Server): http.Server {
        const wss = new WebSocketServer({
            server,
        });

        wss.on("connection", ws => {
            ws.on("error", err => {
                console.info(`error: ${err}`);
            });

            ws.on("message", data => {
                const socketMessage = JSON.parse(
                    data.toString(),
                ) as SocketMessage;

                switch (socketMessage.type) {
                    case "Subscribe":
                        this.addSubscribeClient(socketMessage.boardId, ws);
                        break;
                    case "Unsubscribe":
                        this.removeSubscribeClient(socketMessage.boardId, ws);
                        break;
                }
                this.streamMessages.publish({ client: ws, socketMessage });
            });

            ws.on("close", () => {
                this.removeClientFromAllSubscribes(ws);
            });
        });

        return server;
    }

    /* 	subscribe(boardId: string, subject: Stream<BoardEvent>): void {
        this.streamMessages.subscribe(message => {

        }
    } */

    publish(boardId: string, message: SocketMessage): void {
        const clients = this.boardSubscribesClient.get(boardId) ?? [];
        const content = JSON.stringify(message);
        for (const client of clients) {
            client.send(content);
        }
    }

    private addSubscribeClient(boardId: string, ws: WebSocket.WebSocket): void {
        const clients = this.boardSubscribesClient.get(boardId) ?? [];
        clients.push(ws);
        this.boardSubscribesClient.set(boardId, clients);
    }

    private removeSubscribeClient(
        boardId: string,
        ws: WebSocket.WebSocket,
    ): void {
        const clients = this.boardSubscribesClient.get(boardId) ?? [];
        const index = clients.indexOf(ws);
        if (index !== -1) {
            clients.splice(index, 1);
        }
        this.boardSubscribesClient.set(boardId, clients);
    }

    private removeClientFromAllSubscribes(ws: WebSocket.WebSocket): void {
        for (const clients of this.boardSubscribesClient.values()) {
            const index = clients.indexOf(ws);
            if (index !== -1) {
                clients.splice(index, 1);
            }
        }
    }
}
