import express from "express";
import { getBoardsRouter, Boards } from "Routes/V1/Boards";
import { getAuthRouter, Auth } from "Routes/V1/Auth";
import { Users } from "Routes/V1/Users";
import winston from "winston";
import { jwtMiddleware } from "Middlewares/jwt.middleware";
import { getUsersRouter } from "./Users";
import { Config } from "shared/config/config";
import { Mailer } from "shared/modules/mailer/mailer";
import { createMediaRouter } from "./Media";
import { MediaDAL } from "./Media/MediaDAL";
import { getMiroRouter } from "./Miro";
import path from "path";

export function getV1Router(
    config: Config,
    mailer: Mailer,
    boards: Boards,
    logger: winston.Logger,
    auth: Auth,
    users: Users,
    media: MediaDAL
): express.Router {
    const router = express.Router();
    const authMiddleware = jwtMiddleware(logger);
    router.use("/api/v1", getAuthRouter(auth, logger));
    router.use("/api/v1", getBoardsRouter(boards, logger));
    router.use("/api/v1", createMediaRouter(media, logger));
    // BUG: Миддлвар блокирует запрос GET boards/:id без токена по edit/view ссылке
    // router.use(authMiddleware);
    router.use("/api/v1", getUsersRouter(users, logger));
    router.use("/api/v1/miro", getMiroRouter());

    router.get('/api/v1/embed.js', (req, res) => {
        res.sendFile(path.resolve(__dirname, "./Embedding/embedMicroboard.js"));
    });

    return router;
}
