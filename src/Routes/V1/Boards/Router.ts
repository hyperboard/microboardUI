import express, { Request, Response, NextFunction } from "express";
import winston from "winston";
import { v4 as uuidv4 } from "uuid";
import { body, validationResult, param, query } from "express-validator";
import { Boards } from "./Boards";
import { authenticate } from "Middlewares";
import { AccessToken } from "Interface";
import { jwtMiddleware } from "Middlewares/jwt.middleware";
import validator from "validator";
import { createToken } from "Tokens";
import { HttpStatus } from "shared/enums/http-status.enum";

function checkPermissions(
    jwt: AccessToken,
    action: "owns" | "edits" | "reads",
    resource: "boards" | "catalogs" | "groups",
    resourceId: string
): boolean {
    if (!jwt || !jwt[action]?.[resource]) {
        return false;
    }
    return jwt[action]![resource]?.includes(resourceId) ?? false;
}

function forbidden(res: Response): void {
    res.status(403).json({
        message:
            "Forbidden - User does not have the necessary permissions for the resource",
    });
}

function isUUIDOrRoot(value: unknown): boolean {
    if (
        typeof value === "string" &&
        (value === "root" || validator.isUUID(value))
    ) {
        return true;
    }
    throw new Error('catalogId must be a valid UUID or "root"');
}

function hasRootCatalogPermission(token: AccessToken): boolean {
    return checkPermissions(token, "owns", "catalogs", "root");
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
        body("catalogId").optional().custom(isUUIDOrRoot),
        body("title").optional().isString(),
        async (req: Request, res: Response) => {
            try {
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    return res.status(400).json({ errors: errors.array() });
                }

                const boardId = uuidv4();
                const title: string = req.body.title || boardId;
                const ownerId = req.body.ownerId || undefined;

                const catalogId = req.params.catalogId ?? "root";
                if (
                    !checkPermissions(req.token, "owns", "catalogs", catalogId)
                ) {
                    return forbidden(res);
                }

                const { authorKey } = await boards.createBoard(boardId, title, ownerId);
                return res.status(201).json({
                    boardId: boardId,
                    boardUrl: `/boards/${boardId}`,
                    board: `/boards/${boardId}`,
                    authorKey,
                });
            } catch (err) {
                logger.error(err);
                return res.status(500).send("Server error");
            }
        }
    );

    router.get(
        "/boards",
        authenticate,
        async (req: Request, res: Response) => {
            try {
                const boardsData = await boards.getBoards(req.token);
                return res.status(200).json(boardsData);
            } catch (err) {
                logger.error(`Error fetching boards: ${err}`);
                return res.status(500).json({ error: `Error fetching boards: ${err}` });
            }
        }
    );

    // Getting board details
    router.get(
        "/boards/:boardId/details",
        authenticate,
        param("boardId").isUUID(),
        async (req: Request, res: Response) => {
            try {
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    return res.status(400).json({ errors: errors.array() });
                }

                const boardId = req.params.boardId;

                if (
                    !hasRootCatalogPermission(req.token) &&
                    !checkPermissions(req.token, "owns", "boards", boardId) &&
                    !checkPermissions(req.token, "edits", "boards", boardId) &&
                    !checkPermissions(req.token, "reads", "boards", boardId)
                ) {
                    return forbidden(res);
                }

                const boardDetails = await boards.getBoardDetails(boardId);

                if (!boardDetails) {
                    return res.status(404).json({ message: "Board not found" });
                }

                return res.status(200).json(boardDetails);
            } catch (err) {
                logger.error(err);
                return res.status(500).send("Server error");
            }
        }
    );

    if (process.env.IS_PUBLIC_BOARDS_ENABLED) {
        // Creating a new public board
        router.post(
            "/public-boards",
            body("title").optional().isString(),
            async (req: Request, res: Response) => {
                try {
                    const boardId = uuidv4();
                    const editLink = uuidv4();

                    const title: string = req.body.title || `${editLink}`;
                    const { authorKey } = await boards.createBoard(boardId, title);
                    await boards.createLink(boardId, "edit", editLink);

                    return res.status(201).json({
                        boardId: boardId,
                        linkId: editLink,
                        linkUri: `/boards/${editLink}`,
                        authorKey,
                    });
                } catch (err) {
                    logger.error(err);
                    return res.status(500).send("Server error");
                }
            }
        );
    }
    
    router.post(
        "/boards/claim",
        authenticate,
        async (req, res) => {
            const { authorKeys, visited } = req.body;
            if (authorKeys && authorKeys.length < 0 || visited && visited.length < 0) {
                return res.status(400).json({ error: "wrong format, cant claim / nothing to claim" });
            }
        
            try {
                if (authorKeys) {
                    await Promise.all(authorKeys.map(
                        async (authorKey: string) => await boards.setOwner(req.token, authorKey)
                    ));
                }
                if (visited) {
                    await Promise.all(visited.map(
                        async (linkId: string) => 
                            await boards.userVisited(req.token, linkId)
                    ));
                }
                res.status(200).json({ message: "Boards claimed successfully" });
            } catch (error) {
                logger.error(`Error claiming boards: ${error}`);
                res.status(500).json({ error: `Error claiming boards: ${error}` });
            }
        }
    )

    // Deleting a board
    router.delete(
        "/boards/:boardId",
        authenticate,
        param("boardId").isUUID(),
        body("catalogId").optional().custom(isUUIDOrRoot),
        async (req: Request, res: Response) => {
            try {
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    return res.status(400).json({ errors: errors.array() });
                }

                const boardId = req.params.boardId as string;

                const hasBoardOwnership = checkPermissions(
                    req.token,
                    "owns",
                    "boards",
                    boardId
                );

                const catalogId = req.body.catalogId;

                const hasCatalogPermission = checkPermissions(
                    req.token,
                    "owns",
                    "catalogs",
                    catalogId
                );

                if (
                    !hasRootCatalogPermission(req.token) &&
                    !hasBoardOwnership &&
                    !hasCatalogPermission
                ) {
                    return forbidden(res);
                }

                const isBoardExist = await boards.isBoardExists(boardId);

                if (isBoardExist) {
                    await boards.deleteBoard(boardId);
                }

                return res.status(204).send();
            } catch (err) {
                logger.error(err);
                return res.status(500).send("Server error");
            }
        }
    );

    // Deleting a board without authentication but with authorKey
    router.delete(
        "/boards/:boardId/:authorKey",
        param("boardId").isUUID(),
        param("authorKey").isUUID(),
        async (req: Request, res: Response) => {
            try {
                const { boardId, authorKey } = req.params;

                const isBoardExist = await boards.isBoardExists(boardId);
                if (!isBoardExist) {
                    return res.status(404).json({ message: "Board not found" });
                }

                const isValidAuthorKey = await boards.isValidAuthorKey(boardId, authorKey);
                if (!isValidAuthorKey) {
                    return res.status(403).json({ message: "Invalid author key" });
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
        body("catalogId").optional().custom(isUUIDOrRoot),
        param("boardId").isUUID(),
        async (req: Request, res: Response) => {
            try {
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    return res.status(400).json({ errors: errors.array() });
                }

                const catalogId = req.params.catalogId;

                const hasCatalogPermission = checkPermissions(
                    req.token,
                    "owns",
                    "catalogs",
                    catalogId
                );

                const originalBoardId = req.params.boardId;

                const hasBoardOwnership = checkPermissions(
                    req.token,
                    "owns",
                    "boards",
                    originalBoardId
                );

                if (
                    !hasRootCatalogPermission(req.token) &&
                    !hasCatalogPermission &&
                    !hasBoardOwnership
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
        body("catalogId").optional().custom(isUUIDOrRoot),
        param("boardId").isUUID(),
        body("newTitle").isString(),
        async (req: Request, res: Response) => {
            try {
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    return res.status(400).json({ errors: errors.array() });
                }

                const boardId = req.params.boardId;

                const hasBoardOwnership = checkPermissions(
                    req.token,
                    "owns",
                    "boards",
                    boardId
                );

                const catalogId = req.params.catalogId;

                const hasCatalogPermission = checkPermissions(
                    req.token,
                    "owns",
                    "catalogs",
                    catalogId
                );

                const newTitle = req.body.newTitle;

                if (
                    !hasRootCatalogPermission(req.token) &&
                    !hasCatalogPermission &&
                    !hasBoardOwnership
                ) {
                    return forbidden(res);
                }

                const isBoardExists = await boards.isBoardExists(boardId);
                if (!isBoardExists) {
                    return res.status(404).json({ message: "Board not found" });
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
                    !checkPermissions(req.token, "owns", "boards", boardId) &&
                    !checkPermissions(req.token, "edits", "boards", boardId)
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
                    !checkPermissions(req.token, "owns", "boards", boardId) &&
                    !checkPermissions(req.token, "edits", "boards", boardId) &&
                    !checkPermissions(req.token, "reads", "boards", boardId)
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

    // Creating a link to a board for reading or editing unauthed
    router.post(
        "/boards/:boardId/links/unauthed",
        param("boardId").isUUID(),
        body("type").isIn(["edit", "view"]),
        body("authorKey").isUUID(),
        async (req: Request, res: Response) => {
            try {
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    return res.status(HttpStatus.BAD_REQUEST).json({ errors: errors.array() });
                }

                const boardId = req.params.boardId;
                const { type, authorKey } = req.body
                
                const boardExists = await boards.isBoardExists(boardId);
                if (!boardExists) {
                    return res.status(HttpStatus.NOT_FOUND).json({ message: "Board not found" });
                }
                
                const hasBoardOwnership = boards.isValidAuthorKey(boardId, authorKey)
                if (!hasBoardOwnership) {
                    return forbidden(res);
                }
                
                const linkId = uuidv4();
                await boards.createLink(boardId, type, linkId);

                const linkUri = `./boards/${linkId}`;
                return res.status(HttpStatus.CREATED).json({
                    linkId,
                    linkUri,
                });
            } catch (err) {
                logger.error(err);
                return res.status(500).send("Server error");
            }
        }
    );

    // Creating a link to a board for reading or editing
    router.post(
        "/boards/:boardId/links",
        authenticate,
        param("boardId").isUUID(),
        body("type").isIn(["edit", "view"]),
        async (req: Request, res: Response) => {
            try {
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    return res.status(400).json({ errors: errors.array() });
                }

                const boardId = req.params.boardId;

                const hasBoardOwnership = checkPermissions(
                    req.token,
                    "owns",
                    "boards",
                    boardId
                );

                const type = req.body.type;
                const linkId = uuidv4();

                if (
                    !hasRootCatalogPermission(req.token) &&
                    !hasBoardOwnership
                ) {
                    return forbidden(res);
                }

                const isBoardExist = await boards.isBoardExists(boardId);

                if (!isBoardExist) {
                    return res.status(404).json({ message: "Board not found" });
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

    router.get(
        "/boards/:boardId/links/:linkId/details",
        authenticate,
        param("boardId").isUUID(),
        param("linkId").isUUID(),
        async (req: Request, res: Response) => {
            try {
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    return res.status(400).json({ errors: errors.array() });
                }

                const { boardId, linkId } = req.params;

                if (
                    !hasRootCatalogPermission(req.token) &&
                    !checkPermissions(req.token, "owns", "boards", boardId) &&
                    !checkPermissions(req.token, "edits", "boards", boardId) &&
                    !checkPermissions(req.token, "reads", "boards", boardId)
                ) {
                    return forbidden(res);
                }

                const linkDetails = await boards.getLinkDetails(linkId);

                if (!linkDetails) {
                    return res.status(404).json({ message: "Link not found" });
                }

                return res.status(200).json(linkDetails);
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

                const hasBoardOwnership = checkPermissions(
                    req.token,
                    "owns",
                    "boards",
                    boardId
                );

                const linkId = req.params.linkId;

                if (
                    !hasRootCatalogPermission(req.token) &&
                    !hasBoardOwnership
                ) {
                    return forbidden(res);
                }

                const isBoardExists = await boards.isBoardExists(boardId);
                if (!isBoardExists) {
                    return res.status(404).json({ message: "Board not found" });
                }

                const isLinkExists = await boards.isValidLink(linkId, [
                    "edit",
                    "view",
                ]);
                if (isLinkExists) {
                    await boards.deleteLink(boardId, linkId);
                }

                return res.status(204).send();
            } catch (err) {
                logger.error(err);
                return res.status(500).send("Server error");
            }
        }
    );

    // Removing a visited link
    router.delete(
        "/boards/:linkId/visited",
        authenticate,
        param("linkId").isUUID(),
        async (req: Request, res: Response) => {
            try {
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    return res.status(400).json({ errors: errors.array() });
                }

                const linkId = req.params.linkId;

                await boards.deleteVisted(req.token, linkId);

                return res.status(204).send();
            } catch (err) {
                logger.error(`Error removing visited link: ${err}`);
                return res.status(500).send("Server error");
            }
        }
    );

    // Get private boards
    router.get(
        "/boards/private",
        jwtMiddleware(logger),
        async (request, response) => {
            const user = request.token;
            const privateBoards = await boards.getPrivateBoards(user);
            if (!privateBoards) {
                logger.info(
                    `get /api/v1/boards/private Exception: get private boards`
                );
                response.status(404).end();
                return;
            }
            const json = {
                privateBoards,
            };
            response.json(json);
            response.end();
        }
    );

    return router;
}
