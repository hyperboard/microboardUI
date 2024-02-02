import express from "express";
import winston from "winston";
import { WebsocketServer } from "Server/WebSocket";
import { Boards } from "./Boards";
import { BoardEventSM } from "Server/Message"

export function getBoardsRouter(
    boards: Boards,
    logger: winston.Logger,
    ws: WebsocketServer,
): express.Router {
    const router = express.Router();

    /** Create a new board */
    router.post("/boards", async (request, response) => {
        const board = await boards.addBoard();
        if (!board) {
            logger.info(`post /api/v1/boards/ Exception: create a new board`);
            return;
        }
        logger.info(
            `post /api/v1/boards/ Success: create a new board: ${board.uuid}`,
        );
        response.json({
            board: `/boards/${board.uuid}`,
        });
        // TODO ws.publish(board);
        response.end();
    });

    /** Post a new event to a board */
    router.post("/boards/:uuid/events", async (request, response) => {
        const uuid = request.params.uuid;
        const boardEvent = request.body;
        const boardEventBody = boardEvent.body;
        const board = await boards.getBoard(uuid);

        if (!board) {
            logger.info(
                `post /api/v1/boards/:uuid/events Exception: find board ${uuid}`,
            );
            response.status(404).end();
            return;
        }
        board
            .addEvent(boardEventBody.eventId, boardEventBody)
            .then(boardEvent => {
                logger.info(
                    `post /api/v1/boards/:uuid/events Success: add new event to ${uuid}, /n ${JSON.stringify(
                        request.body,
                        null,
                        4,
                    )}`,
                );

                ws.publish(
                    board.uuid,
                    new BoardEventSM(board.uuid, boardEvent),
                );
            });
        response.end();
    });

    /** Get all events from a board */
    router.get("/boards/:uuid/events", async (request, response) => {
        const uuid = request.params.uuid;
        const board = await boards.getBoard(uuid);
        if (!board) {
            logger.info(
                `get /api/v1/boards/:uuid/events Exception: find board ${uuid}`,
            );
            response.status(404).end();
            return;
        }
        const events = await board.listEvents(0);
        const json = {
            board: `/boards/${board.uuid}`,
            events,
        };
        logger.info(
            `get /api/v1/boards/:uuid/events Success: list all events for ${uuid}`,
        );
        response.json(json);
        response.end();
    });

    /** Get all events from a board after an event */
    router.get("/boards/:uuid/events/:event", async (request, response) => {
        const { uuid, event } = request.params;
        const board = await boards.getBoard(uuid);
        if (!board) {
            logger.info(
                `get /api/v1/boards/:uuid/events Exception: find board ${uuid}`,
            );
            response.status(404).end();
            return;
        }
        const events = await board.listEvents(parseInt(event));
        const json = {
            board: `/boards/${board.uuid}`,
            events,
        };
        logger.info(
            `get /api/v1/boards/:uuid/events/:event Success: list events after ${event} for ${uuid}`,
        );
        response.json(json);
        response.end();
    });

    return router;
}
