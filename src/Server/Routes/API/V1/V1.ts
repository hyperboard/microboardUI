import express from "express";
import { Boards } from "Server/Boards";
import winston from "winston";
import { getBoardsRouter } from "./Boards";
import { WebsocketServer } from "../../../WebSocket";

/*
Boards CRUD
Users CRUD
*/

export function getV1Router(
    boards: Boards,
    logger: winston.Logger,
    ws: WebsocketServer,
): express.Router {
    const router = express.Router();
    router.use("/api/v1", getBoardsRouter(boards, logger, ws));
    return router;
}
