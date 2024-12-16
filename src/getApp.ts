import bodyParser from "body-parser";
import compression from "compression";
import cookieParser from "cookie-parser";
import express from "express";
import helmet from "helmet";
import http from "http";
import path from "path";
import { WebSocketServer } from "ws";
import { nocache } from "./nocache";
import { Auth } from "./Routes/V1/Auth";
import { Boards } from "./Routes/V1/Boards";
import { Users } from "./Routes/V1/Users";
import { createMiddleware } from "@trigger.dev/express";
import cors from "cors";
import { db } from "drizzle/db";
import { migrateData } from "drizzle/scripts/board-events-table.migration";
import { runMigration } from "drizzle/scripts/migrate";
import { exceptionMiddleware } from "Middlewares/exception.middleware";
import morgan from "morgan";
import { createMinioMediaDAL } from "Routes/V1/Media";
import { createBarrelMediaDAL } from "Routes/V1/MediaTalk/Media";
import { AccessKeysService } from "Routes/V2/Boards/access-keys.service";
import { getV2Router } from "Routes/V2/V2";
import { client } from "trigger";
import winston from "winston";
import { getV1Router } from "./Routes";
import { Config } from "./shared/config/config";
import { Mailer } from "./shared/modules/mailer/mailer";
import { withWebSocketApi } from "./WebSocket";
import { Templates } from "./Routes/V1/Templates";
import { getRedis } from "Redis";
import { OpenAI } from "ai/openai";
import { AI } from "Routes/V1/AI/AI";
import { BoardsService } from "Routes/V2/Boards/boards.service";
import { FoldersService } from "Routes/V2/Foldres/folders.service";

export async function getApp(): Promise<http.Server> {
    const app = express();

    // await runMigration();

    if (process.env.MIGRATE_EVENTS === "true") {
        await migrateData().catch(console.error);
    }

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
        format: winston.format.combine(
            winston.format.errors({ stack: true }), // Ensure error objects are serialized
            winston.format.metadata(), // Include metadata in logs
            winston.format.json({ space: 2 }) // Output logs in JSON format
        ),
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
                format: winston.format.combine(winston.format.simple(), winston.format.errors({ stack: true })),
            }),
        ],
    });

    logger.info.bind(logger);

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
    const openai = new OpenAI(process.env.OPENAI_API_KEY!);
    const mailer = new Mailer(config, logger, process.env.BASE_URL ?? "example");
    const redis = await getRedis(logger);
    const boards = new Boards(logger);
    const templates = new Templates(logger);
    const accessKeysService = new AccessKeysService(db);
    const boardsService = new BoardsService(db, logger);
    const foldersService = new FoldersService(db, boardsService);
    withWebSocketApi({ wss, boards, accessKeysService, logger, redis, boardsService, openai });
    const media = createMinioMediaDAL(logger);
    const users = new Users(media, logger);
    const auth = new Auth(logger, users, config, mailer);
    const ai = new AI(openai);

    app.get("/", (request, response) => {
        response.status(200).json({});
    });

    app.get("/api/v1/connection", (request, response) => {
        const timestamp = new Date().getTime();
        response.status(200).json({ connection: timestamp });
    });

    const v1Router = getV1Router({
        config,
        mailer,
        boards,
        templates,
        logger,
        auth,
        users,
        media,
        wss,
        redis,
        ai,
    });

    app.use(v1Router);

    const v2Router = await getV2Router({
        boardsService,
        foldersService,
        accessKeysService,
    });

    app.use("/api/v2", v2Router);

    app.use(exceptionMiddleware(logger));

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
        logger.error("Fatal unhandled error");
        logger.error(err);
    };

    process.on("unhandledRejection", onError);
    process.on("uncaughtException", onError);

    return server;
}
