import express, { Request, Response, NextFunction } from "express";
import winston from "winston";
import { v4 as uuidv4 } from "uuid";
import { body, validationResult, param, query } from "express-validator";
import { Boards } from "./Boards";
import { authenticate } from "Middlewares";
import { AccessToken } from "Interface";

function checkPermissions(
    jwt: AccessToken,
    action: "owns" | "edits" | "reads",
    resource: "boards" | "catalogs" | "groups",
    resourceId: string
): boolean {
    if (!jwt || !jwt[action] || !jwt[action]![resource]) {
        return false;
    }
    return jwt[action]![resource].includes(resourceId);
}

function forbidden(res: Response): void {
    res.status(403).json({
        message:
            "Forbidden - User does not have the necessary permissions for the resource",
    });
}

export function getBoardsRouter(
    boards: Boards,
    logger: winston.Logger
): express.Router {
    const router = express.Router();

    // Creating a new board
    router.post(
        "/boards",
        authenticate,
        body("catalogId").optional().isUUID(),
        body("title").optional().isString(),
        async (req: Request, res: Response) => {
            try {
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    return res.status(400).json({ errors: errors.array() });
                }

                const boardId = uuidv4();
                const title: string = req.body.title || boardId;

                const catalogId = req.params.catalogId ?? "root";
                if (
                    !checkPermissions(req.user, "owns", "catalogs", catalogId)
                ) {
                    return forbidden(res);
                }

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

    // Creating a new public board
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
        body("catalogId").optional().isUUID(),
        query("boardId").isUUID(),
        async (req: Request, res: Response) => {
            try {
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    return res.status(400).json({ errors: errors.array() });
                }

                const catalogId = req.params.catalogId;
                const boardId = req.query.boardId as string;

                if (
                    !checkPermissions(
                        req.user,
                        "owns",
                        "catalogs",
                        catalogId
                    ) &&
                    !checkPermissions(req.user, "owns", "boards", boardId)
                ) {
                    return forbidden(res);
                }

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
        body("catalogId").optional().isUUID(),
        param("boardId").isUUID(),
        async (req: Request, res: Response) => {
            try {
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    return res.status(400).json({ errors: errors.array() });
                }

                const catalogId = req.params.catalogId;
                const originalBoardId = req.params.boardId;

                if (
                    !checkPermissions(
                        req.user,
                        "owns",
                        "catalogs",
                        catalogId
                    ) &&
                    !checkPermissions(
                        req.user,
                        "owns",
                        "boards",
                        originalBoardId
                    )
                ) {
                    return forbidden(res);
                }

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
        body("catalogId").optional().isUUID(),
        param("boardId").isUUID(),
        body("newTitle").isString(),
        async (req: Request, res: Response) => {
            try {
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    return res.status(400).json({ errors: errors.array() });
                }

                const boardId = req.params.boardId;
                const catalogId = req.params.catalogId;
                const newTitle = req.body.newTitle;

                if (
                    !checkPermissions(
                        req.user,
                        "owns",
                        "catalogs",
                        catalogId
                    ) &&
                    !checkPermissions(req.user, "owns", "boards", boardId)
                ) {
                    return forbidden(res);
                }

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
        param("boardId").isUUID(),
        body("eventId").isUUID(),
        body("eventBody").isObject(),
        async (req: Request, res: Response): Promise<any> => {
            try {
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    return res.status(400).json({ errors: errors.array() });
                }

                const boardId = req.params.boardId;
                const eventId = req.body.eventId;
                const eventBody = req.body.eventBody;

                if (
                    !checkPermissions(req.user, "owns", "boards", boardId) &&
                    !checkPermissions(req.user, "edits", "boards", boardId)
                ) {
                    return forbidden(res);
                }

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

                if (
                    !checkPermissions(req.user, "owns", "boards", boardId) &&
                    !checkPermissions(req.user, "edits", "boards", boardId) &&
                    !checkPermissions(req.user, "views", "boards", boardId)
                ) {
                    return forbidden(res);
                }

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

                if (!checkPermissions(req.user, "owns", "boards", boardId)) {
                    return forbidden(res);
                }

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

                if (!checkPermissions(req.user, "owns", "boards", boardId)) {
                    return forbidden(res);
                }

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
