import express from "express";
import { Boards } from "Server/Boards";
import { Auth } from "Server/Auth";
import winston from "winston";
import { getBoardsRouter } from "./Boards";
import { WebsocketServer } from "../../../WebSocket";
import { getAuthRouter } from "./Auth";
import { jwtMiddleware } from "../../../Middlewares/jwt.middleware";

/*
Boards CRUD
Users CRUD
*/

export function getV1Router(
    boards: Boards,
    logger: winston.Logger,
    ws: WebsocketServer,
    auth: Auth,
): express.Router {
    const router = express.Router();
    router.use("/api/v1/auth", getAuthRouter(auth));
    router.use(jwtMiddleware(logger));
    router.use("/api/v1", getBoardsRouter(boards, logger, ws));
    return router;
}
