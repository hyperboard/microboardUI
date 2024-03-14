import express, { Request, Response, NextFunction } from "express";
import winston from "winston";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import { body, validationResult, param, query } from "express-validator";
import { Boards } from "./Boards";

const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const token = authHeader.split(" ")[1];

    try {
        const claims = jwt.verify(token, process.env.JWT_SECRET ?? "");
        req.user = claims as { sub: string; boards?: Record<string, string[]> };
        return next();
    } catch (error) {
        return res
            .status(401)
            .json({ message: "Invalid or expired JWT token" });
    }
};

const checkBoardPermissions = (permission: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const boardId = req.params.boardId || req.query.boardId;
        if (
            req.user &&
            req.user.boards &&
            req.user.boards[boardId]?.includes(permission)
        ) {
            next();
        } else {
            res.status(403).json({
                message:
                    "Forbidden - User does not have the necessary permissions for the resource",
            });
        }
    };
};

export function getBoardsRouter(
    boards: Boards,
    logger: winston.Logger
): express.Router {
    const router = express.Router();

    // Creating a new board
    router.post(
        "/boards",
        authenticate,
        checkBoardPermissions("create"),
        body("title").optional().isString(),
        async (req: Request, res: Response) => {
            try {
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    return res.status(400).json({ errors: errors.array() });
                }

                const boardId = uuidv4();
                const title: string = req.body.title || boardId;
                await boards.createBoard(boardId, title);
                return res.status(201).json({
                    boardId: boardId,
                    boardUrl: `/boards/${boardId}`,
                    board: `/boards/${boardId}`,
                });
            } catch (err) {
                logger.error(err);
                return res.status(500).send("Server error");
            }
        }
    );

    router.post(
        "/public-boards",
        body("title").optional().isString(),
        async (req: Request, res: Response) => {
            try {
                const boardId = uuidv4();
                const editLink = uuidv4();

                const title: string = req.body.title || `${editLink}`;
                await boards.createBoard(boardId, title);
                await boards.createLink(boardId, "edit", editLink);

                return res.status(201).json({
                    boardId: boardId,
                    linkId: editLink,
                    linkUri: `/boards/${editLink}`,
                });
            } catch (err) {
                logger.error(err);
                return res.status(500).send("Server error");
            }
        }
    );

    // Deleting a board
    router.delete(
        "/boards",
        authenticate,
        checkBoardPermissions("delete"),
        query("boardId").isUUID(),
        async (req: Request, res: Response) => {
            try {
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    return res.status(400).json({ errors: errors.array() });
                }

                const boardId = req.query.boardId as string;
                await boards.deleteBoard(boardId);
                return res.status(204).send();
            } catch (err) {
                logger.error(err);
                return res.status(500).send("Server error");
            }
        }
    );

    // Duplicating a board
    router.post(
        "/boards/:boardId/duplicate",
        authenticate,
        checkBoardPermissions("duplicate"),
        param("boardId").isUUID(),
        async (req: Request, res: Response) => {
            try {
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    return res.status(400).json({ errors: errors.array() });
                }

                const originalBoardId = req.params.boardId;
                const newBoardId = uuidv4();
                await boards.duplicateBoard(originalBoardId, newBoardId);
                return res.status(200).json({ newBoardId: newBoardId });
            } catch (err) {
                logger.error(err);
                return res.status(500).send("Server error");
            }
        }
    );

    // Renaming a board
    router.patch(
        "/boards/:boardId",
        authenticate,
        checkBoardPermissions("edit"),
        param("boardId").isUUID(),
        body("newTitle").isString(),
        async (req: Request, res: Response) => {
            try {
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    return res.status(400).json({ errors: errors.array() });
                }

                const boardId = req.params.boardId;
                const newTitle = req.body.newTitle;
                await boards.renameBoard(boardId, newTitle);
                return res.status(200).send();
            } catch (err) {
                logger.error(err);
                return res.status(500).send("Server error");
            }
        }
    );

    // Adding an event to a board
    router.post(
        "/boards/:boardId/events",
        authenticate,
        checkBoardPermissions("edit"),
        param("boardId").isUUID(),
        body("eventId").isUUID(),
        body("eventBody").isObject(),
        async (req: Request, res: Response): Promise<any> => {
            try {
                /*
                const uuid = request.params.uuid;
                const boardEvent = request.body;
                const boardEventBody = boardEvent.body;
                const board = await boards.getBoard(uuid);
    	
                if (!board) {
                    logger.info(
                        `post /api/v1/boards/:uuid/events Exception: find board ${uuid}`
                    );
                    response.status(404).end();
                    return;
                }
                board
                    .addEvent(boardEventBody.eventId, boardEventBody)
                    .then((boardEvent) => {
                        logger.info(
                            `post /api/v1/boards/:uuid/events Success: add new event to ${uuid}, /n ${JSON.stringify(
                                request.body,
                                null,
                                4
                            )}`
                        );
    	
                        ws.publish(
                            board.uuid,
                            new BoardEventSM(board.uuid, boardEvent)
                        );
                    });
                response.end();
                */
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    return res.status(400).json({ errors: errors.array() });
                }

                const boardId = req.params.boardId;
                const eventId = req.body.eventId;
                const eventBody = req.body.eventBody;
                const boardEvent = await boards.addEventToBoard(
                    boardId,
                    eventId,
                    eventBody
                );
                return res.status(201).send();
            } catch (err) {
                logger.error(err);
                return res.status(500).send("Server error");
            }
        }
    );

    // Retrieving board events
    router.get(
        "/boards/:boardId/events",
        authenticate,
        checkBoardPermissions("view"),
        param("boardId").isUUID(),
        query("page").optional().isInt({ min: 1 }),
        query("limit").optional().isInt({ min: 1, max: 100 }),
        async (req: Request, res: Response): Promise<any> => {
            try {
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    return res.status(400).json({ errors: errors.array() });
                }

                const boardId = req.params.boardId;
                const page: number = parseInt(req.query.page as string) || 1;
                const limit: number = parseInt(req.query.limit as string) || 10;
                const events = await boards.getBoardEvents(
                    boardId,
                    page,
                    limit
                );
                res.status(200).json(events);
            } catch (err) {
                logger.error(err);
                res.status(500).send("Server error");
            }
        }
    );

    // Creating a link to a board for reading or editing
    router.post(
        "/boards/:boardId/links",
        authenticate,
        checkBoardPermissions("isOwner"),
        param("boardId").isUUID(),
        body("type").isIn(["read", "edit"]),
        async (req: Request, res: Response) => {
            try {
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    return res.status(400).json({ errors: errors.array() });
                }

                const boardId = req.params.boardId;
                const type = req.body.type;
                const linkId = uuidv4();
                await boards.createLink(boardId, type, linkId);

                const linkUri = `./boards/${linkId}`;
                return res.status(201).json({
                    linkId: linkId,
                    linkUri: linkUri,
                });
            } catch (err) {
                logger.error(err);
                return res.status(500).send("Server error");
            }
        }
    );

    // Remove link to a board
    router.delete(
        "/boards/:boardId/links/:linkId",
        authenticate,
        checkBoardPermissions("isOwner"),
        param("boardId").isUUID(),
        param("linkId").isUUID(),
        async (req: Request, res: Response) => {
            try {
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    return res.status(400).json({ errors: errors.array() });
                }

                const boardId = req.params.boardId;
                const linkId = req.params.linkId;
                await boards.deleteLink(boardId, linkId);

                return res.status(204).send();
            } catch (err) {
                logger.error(err);
                return res.status(500).send("Server error");
            }
        }
    );

    return router;
}
