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
    router.use("/api/v1", getAuthRouter(auth, logger));
    router.use("/api/v1", getBoardsRouter(boards, logger));
    router.use("/api/v1",
        process.env.MINIO_ENABLED === "true"
        ? createMediaRouter(media as MediaDAL, logger)
        : getMediaRouter(media as BarrelMediaDAL, logger)
    );
    router.use("/api/v1", createJobsRouter(logger, wss));
    router.use("/api/v1", createTalkRouter());
    // BUG: Миддлвар блокирует запрос GET boards/:id без токена по edit/view ссылке
    // router.use(authMiddleware);
    router.use("/api/v1", getUsersRouter(users, logger));
    router.use("/api/v1/miro", getMiroRouter());

    router.get('/api/v1/embed.js', (req, res) => {
        const filePath = path.resolve(__dirname, "./Embedding/embedMicroboard.js");
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                logger.error('Error reading embedMicroboard.js', err);
                return res.status(500).send('Internal Server Error');
            }
            const updatedData = data.replaceAll(/<embedUrl\/>/g, process.env.EMBED_URL || '');
            res.type('application/javascript').send(updatedData);
        });
    });

    return router;
}
