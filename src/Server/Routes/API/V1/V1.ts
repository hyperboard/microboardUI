import express from "express";
import { Boards } from "Server/Boards";
import { Auth } from "Server/Auth";
import { Users } from "Server/Users";
import winston from "winston";
import { getBoardsRouter } from "./Boards";
import { WebsocketServer } from "../../../WebSocket";
import { getAuthRouter } from "./Auth";
import { jwtMiddleware } from "../../../shared/middlewares";
import { getUsersRouter } from "./Users";
import { Config } from "Server/shared/config/config";
import { Mailer } from "Server/shared/modules/mailer/mailer";

/*
Boards CRUD
Users CRUD
*/

export function getV1Router(
    config: Config,
    mailer: Mailer,
    boards: Boards,
    logger: winston.Logger,
    ws: WebsocketServer,
    auth: Auth,
    users: Users
): express.Router {
    const router = express.Router();
    const authMiddleware = jwtMiddleware(logger);
    router.use("/api/v1", getAuthRouter(auth));
    router.use("/api/v1", getBoardsRouter(boards, logger, ws));
    router.use(authMiddleware);
    router.use("/api/v1", getUsersRouter(users, logger));

    return router;
}
