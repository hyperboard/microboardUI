import express from "express";
import bodyParser from "body-parser";
import compression from "compression";
import cookieParser from "cookie-parser";
import winston from "winston";
import path from "path";
import helmet from "helmet";
import { nocache } from "./nocache";
import { Boards } from "./Routes/API/V1/Boards";
import { getDatabase } from "./Database";
import { getV1Router } from "./Routes";
import { WebsocketServer } from "./WebSocket";
import { BoardEventListSM } from "../Connection/SocketMessage";
import { EventsManager, EventsQueueManager } from "./WebSocket/EventsManager";

export async function getExpressApp(
    ws: WebsocketServer,
): Promise<express.Express> {
    const app = express();

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(cookieParser());
    app.use(compression());

    // Create a winston logger.
    const logger = winston.createLogger({
        level: "info",
        format: winston.format.json(),
        defaultMeta: {
            service: "user-service",
        },
        transports: [
            // Write all logs error (and below) to `error.log`.
            new winston.transports.File({
                filename: "error.log",
                level: "error",
            }),
            // Write to all logs with level `info` and below to `combined.log`
            new winston.transports.File({ filename: "combined.log" }),
            // Write all logs with level `info` and below to console.
            new winston.transports.Console({
                format: winston.format.simple(),
            }),
        ],
    });

    logger.info.bind(logger);

    // Pass morgan HTTP request logs to winston.
    /* 	app.use(
        morgan("combined", {
            stream: {
                write: message => {
                    logger.info(message);
                },
            },
        }),
    ); */

    // Atlassian security policy requirements
    // http://go.atlassian.com/security-requirements-for-cloud-apps
    // HSTS must be enabled with a minimum age of at least one year
    app.use(
        helmet.hsts({
            maxAge: 31536000,
            includeSubDomains: false,
        }),
    );
    app.use(
        helmet.referrerPolicy({
            policy: ["origin"],
        }),
    );

    const staticPath = path.join(process.cwd(), "public");

    app.use(express.static(staticPath));
    app.use(nocache);

    app.use((req, res, next) => {
        // TODO 'crutch' where borowser request page - Content-Type is undefined.
        if (req.path.includes("favicon.svg")) {
            res.sendFile("favicon.svg", { root: staticPath });
        } else if (req.path.includes("bundle.js.map")) {
            res.sendFile("bundle.js.map", { root: staticPath });
        } else if (req.accepts("html") && !req.get("Content-Type")) {
            res.sendFile("index.html", { root: staticPath });
        } else {
            next();
        }
    });

    const database = await getDatabase(logger);
    const boards = new Boards(database, logger);
    const eventsQueueManager = new EventsQueueManager();

    app.get("/", (request, response) => {
        response.status(200).json({});
    });

    app.get("/api/v1/connection", (request, response) => {
        const timestamp = new Date().getTime();
        response.status(200).json({ connection: timestamp });
    });

    app.use("/", getV1Router(boards, logger, ws));

    ws.streamMessages.subscribe(({ client, socketMessage }) => {
        if (socketMessage.type === "BoardEvent") {
            eventsQueueManager.addEvent(socketMessage.boardId, socketMessage.event.body);
        } else if (socketMessage.type === "Subscribe") {
            const index = socketMessage.index;
            boards.getBoard(socketMessage.boardId).then(board => {
                if (board) {
                    board.listEvents(index).then(events => {
                        // TODO сериализация вно не должна производится здесь, а внутри ws.publish, к примеру.
                        //  Нужно передавать не WebSocket, а клиента, с его методами.
                        client.send(
                            JSON.stringify(
                                new BoardEventListSM(board.uuid, events),
                            ),
                        );
                    });
                }
            });
        }
    });

    const eventsManager = new EventsManager(boards, (boardId, events) => {
        ws.publish(boardId, new BoardEventListSM(boardId, events));
    }, logger);

    setInterval(() => {
        eventsQueueManager.getAllQueue().forEach(eventsQueue => {
            const boardId = eventsQueue.boardId;
            if (eventsManager.isBoardReady(boardId)) {
                eventsQueueManager.remove(eventsQueue);
                eventsManager.saveBodyEvents(boardId, eventsQueue.eventBodyQueue);
            }
        })
    }, 10);


    return app;
}
