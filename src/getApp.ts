import express from "express";
import bodyParser from "body-parser";
import compression from "compression";
import cookieParser from "cookie-parser";
import winston from "winston";
import path from "path";
import helmet from "helmet";
import http from "http";
import { WebSocketServer } from "ws";
import morgan from "morgan";

import { nocache } from "./nocache";
import { Boards } from "./Routes/V1/Boards";
import { Auth } from "./Routes/V1/Auth";
import { Users } from "./Routes/V1/Users";
import { getV1Router } from "./Routes";
import { withWebSocketApi } from "./WebSocket";
import { Config } from "./shared/config/config";
import { Mailer } from "./shared/modules/mailer/mailer";
import { createBarrelMediaDAL } from "Routes/V1/MediaTalk/Media";
import { createMinioMediaDAL } from "Routes/V1/Media";
import { createMiddleware } from "@trigger.dev/express";
import { client } from "trigger";
import cors from "cors";
import { runMigration } from "drizzle/scripts/migrate";
import {Templates} from "./Routes/V1/Templates";

export async function getApp(): Promise<http.Server> {
    const app = express();

    await runMigration();

    app.use(morgan("combined"));
    if (process.env.NODE_ENV !== "production") {
        app.use(cors());
    }

    const server = http.createServer(app);
    const wss = new WebSocketServer({
        server,
    });

    app.use(bodyParser.json({ limit: "10mb" }));
    app.use(bodyParser.urlencoded({ extended: false, limit: "10mb" }));
    app.use(cookieParser());
    app.use(compression());

    app.use(createMiddleware(client, "/api/trigger"));

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
        })
    );
    app.use(
        helmet.referrerPolicy({
            policy: ["origin"],
        })
    );

    const staticPath = path.join(process.cwd(), "public");

    app.use(express.static(staticPath));
    app.use(nocache);

    const config = new Config();
    const mailer = new Mailer(config, logger, process.env.BASE_URL ?? "example");
    const boards = new Boards(logger);
    const templates = new Templates(logger);
    withWebSocketApi(wss, boards, logger);
    const auth = new Auth(logger, config, mailer);
    const users = new Users(logger);

    app.get("/", (request, response) => {
        response.status(200).json({});
    });

    app.get("/api/v1/connection", (request, response) => {
        const timestamp = new Date().getTime();
        response.status(200).json({ connection: timestamp });
    });

    const media = process.env.MINIO_ENABLED === "true" ? createMinioMediaDAL(logger) : createBarrelMediaDAL(logger);

    app.use("/", getV1Router(config, mailer, boards, templates, logger, auth, users, media, wss));

    app.use((req, res, next) => {
        if (req.path.includes("favicon.svg")) {
            res.sendFile("favicon.svg", { root: staticPath });
        } else if (req.path.includes("bundle.js.map")) {
            res.sendFile("bundle.js.map", { root: staticPath });
        } else if (req.accepts("html") && !req.get("Content-Type")) {
            // BUG: blocks delete requests of downstream routers
            res.sendFile("index.html", { root: staticPath });
        } else {
            next();
        }
    });

    const onError = (err: unknown) => {
        logger.warn("Caught unhandled exception");
        if (err instanceof Error) {
            logger?.warn(err.message);
            console.error(err);
        }
    };
    process.on("unhandledRejection", onError);
    process.on("uncaughtException", onError);
    return server;
}
