import express from "express";
import { getBoardsRouter, Boards } from "Routes/V1/Boards";
import { getAuthRouter, Auth } from "Routes/V1/Auth";
import { Users } from "Routes/V1/Users";
import winston from "winston";
import { jwtMiddleware } from "Middlewares/jwt.middleware";
import { getUsersRouter } from "./Users";
import { Config } from "shared/config/config";
import { Mailer } from "shared/modules/mailer/mailer";
import { getMiroRouter } from "./Miro";
import { createJobsRouter } from "./Jobs";
import { createTalkRouter } from "./Talk";
import { WebSocketServer } from "ws";
import path from "path";
import { BarrelMediaDAL } from "./MediaTalk/MediaDAL";
import { getMediaRouter } from "./MediaTalk";
import { MediaDAL } from "./Media/MediaDAL";
import { createMediaRouter } from "./Media";
import fs from "fs";
import { internalError } from "shared/lib/routing";

function createFileRoute(
    router: express.Router,
    routePath: string,
    filePath: string,
    logger: winston.Logger,
    sendType: string,
    encoding?: BufferEncoding,
    dataUpdateCb?: (data: string) => string
) {
    router.get(routePath, (req, res) => {
        const resolvedPath = path.resolve(__dirname, filePath);
        const readFileCallback = (err: NodeJS.ErrnoException | null, data: Buffer | string) => {
            if (err) {
                logger.error(`Error reading ${filePath}`, err);
                return internalError(res, err, "Internal Server Error");
            }
            if (dataUpdateCb) {
                data = dataUpdateCb(data as string);
            }
            res.type(sendType).send(data);
        };

        if (encoding) {
            fs.readFile(resolvedPath, encoding, readFileCallback);
        } else {
            fs.readFile(resolvedPath, readFileCallback);
        }
    });
}

export function getV1Router(
    config: Config,
    mailer: Mailer,
    boards: Boards,
    logger: winston.Logger,
    auth: Auth,
    users: Users,
    media: BarrelMediaDAL | MediaDAL,
    wss: WebSocketServer
): express.Router {
    const router = express.Router();
    const authMiddleware = jwtMiddleware(logger);
    const apiBase = "/api/v1";
    router.use(apiBase, getAuthRouter(auth, logger));
    router.use(apiBase, getBoardsRouter(boards, logger));
    router.use(
        apiBase,
        process.env.MINIO_ENABLED === "true"
            ? createMediaRouter(media as MediaDAL, logger)
            : getMediaRouter(media as BarrelMediaDAL, logger)
    );
    router.use(apiBase, createJobsRouter(logger, wss));
    router.use(apiBase, createTalkRouter());
    // BUG: Миддлвар блокирует запрос GET boards/:id без токена по edit/view ссылке
    // router.use(authMiddleware);
    router.use(apiBase, getUsersRouter(users, logger));
    router.use(`${apiBase}/miro`, getMiroRouter());

    createFileRoute(router, `${apiBase}/embed.js`, "./Embedding/embedMicroboard.js", logger, "application/javascript", "utf8", (data) => {
        return data.replaceAll(/<embedUrl\/>/g, process.env.EMBED_URL || "");
    });

    createFileRoute(router, `${apiBase}/dropflow.wasm`, "./dropflow.wasm", logger, "application/wasm");

    createFileRoute(router, `${apiBase}/fonts/Arial.ttf`, "./fonts/Arial.ttf", logger, "font/ttf");
    createFileRoute(router, `${apiBase}/fonts/Arial_Bold.ttf`, "./fonts/Arial_Bold.ttf", logger, "font/ttf");
    createFileRoute(router, `${apiBase}/fonts/Arial_Italic.ttf`, "./fonts/Arial_Italic.ttf", logger, "font/ttf");
    createFileRoute(router, `${apiBase}/fonts/Arial_Bold_Italic.ttf`, "./fonts/Arial_Bold_Italic.ttf", logger, "font/ttf");

    router.get("/api/v1/healthcheck", (req, res) => {
        res.status(200).json({ status: "OK", message: "Server is up and running" });
    });

    return router;
}
