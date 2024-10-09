import express, { Request, Response, NextFunction } from "express";
import winston from "winston";
import { v4 as uuidv4 } from "uuid";
import { body, validationResult, param, query } from "express-validator";
import { Boards, type AnonymousBoard, type OwnedBoard } from "./Boards";
import { authenticate } from "Middlewares";
import { AccessToken } from "Interface";
import { jwtMiddleware } from "Middlewares/jwt.middleware";
import validator from "validator";
import { createToken } from "Tokens";
import { HttpStatus } from "shared/enums/http-status.enum";
import { title } from "process";
import { catchAsync } from "shared/lib/catchAsync";

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
        body("isPublic").optional().isBoolean(),
        body("title").optional().isString(),
        catchAsync(async (req: Request, res: Response) => {
            try {
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    return res.status(400).json({ errors: errors.array() });
                }

                const title: string = req.body.title;
                const ownerId = +req.token.sub || undefined;
                const isPublic = req.body.isPublic || false;

                const catalogId = req.params.catalogId ?? "root";
                if (
                    !checkPermissions(req.token, "owns", "catalogs", catalogId)
                ) {
                    return forbidden(res);
                }

                const board = await boards.createBoard(title, ownerId, isPublic) as OwnedBoard;

                return res.status(201).json({
                    id: board.uniq_id,
                    title: board.boardname,
                    isPublic: board.is_public
                })
            } catch (err) {
                logger.error(err);
                return res.status(500).send("Server error");
            }
        }, logger
    ));

    // Creating a new board unauthed
    router.post(
        "/boards/unauthed",
        body("title").optional().isString(),
        catchAsync(async (req: Request, res: Response) => {
            try {
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    return res.status(400).json({ errors: errors.array() });
                }

                const title: string = req.body.title;

                const board = await boards.createBoard(title, undefined, true) as AnonymousBoard;
                return res.status(201).json({
                    id: board.uniq_id,
                    authorKey: board.author_key,
                    title: board.boardname,
                    isPublic: true
                });
            } catch (err) {
                logger.error(err);
                return res.status(500).send("Server error");
            }
        }, logger
    ));

    router.get(
        "/boards",
        authenticate,
        catchAsync(async (req: Request, res: Response) => {
            try {
                const boardsData = await boards.getBoards(+req.token.sub);
                return res.status(200).json({
                    author: boardsData.author.map((b) => ({
                        id: b.uniq_id,
                        title: b.boardname,
                        isPublic: b.is_public
                    })),
                    canView: boardsData.canView.map((b) => ({
                        id: b.uniq_id,
                        title: b.boardname,
                        isPublic: b.is_public
                    })),
                    canEdit: boardsData.canEdit.map((b) => ({
                        id: b.uniq_id,
                        title: b.boardname,
                        isPublic: b.is_public
                    })),
                    shared: boardsData.shared.map((b) => ({
                        id: b.id,
                        title: b.boardname,
                        isPublic: b.is_public
                    }))
                });
            } catch (err) {
                logger.error(`Error fetching boards: ${err}`);
                return res.status(500).json({ error: `Error fetching boards: ${err}` });
            }
        }, logger)
    );

    // Getting board details
    router.get(
        "/boards/:boardId/details",
        param("boardId").isUUID(),
        catchAsync(async (req: Request, res: Response) => {
            try {
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    return res.status(400).json({ errors: errors.array() });
                }

                const boardId = req.params.boardId;

                const boardDetails = await boards.getBoardDetails(boardId);

                if (!boardDetails) {
                    return res.status(404).json({ message: "Board not found" });
                }

                return res.status(200).json({
                    id: boardId,
                    title: boardDetails.boardname,
                    isPublic: boardDetails.is_public
                });
            } catch (err) {
                logger.error(err);
                return res.status(500).send("Server error");
            }
        }, logger)
    );

    if (process.env.IS_PUBLIC_BOARDS_ENABLED) {
        // Creating a new public board
        router.post(
            "/public-boards",
            body("title").optional().isString(),
            catchAsync(async (req: Request, res: Response) => {
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
            }, logger)
        );
    }

    router.post(
        "/boards/claim",
        authenticate,
        catchAsync(async (req, res) => {
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
        }, logger)
    )

    // Deleting a board
    router.delete(
        "/boards/:boardId",
        authenticate,
        param("boardId").isUUID(),
        body("catalogId").optional().custom(isUUIDOrRoot),
        catchAsync(async (req: Request, res: Response) => {
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
        }, logger)
    );

    // Duplicating a board
    router.post(
        "/boards/:boardId/duplicate",
        authenticate,
        body("catalogId").optional().custom(isUUIDOrRoot),
        param("boardId").isUUID(),
        catchAsync(async (req: Request, res: Response) => {
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
        }, logger)
    );

    // Renaming a board
    router.patch(
        "/boards/:boardId",
        authenticate,
        param("boardId").isUUID(),
        body("newTitle").isString(),
        catchAsync(async (req: Request, res: Response) => {
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
                return res.status(204).send();
            } catch (err) {
                logger.error(err);
                return res.status(500).send("Server error");
            }
        }, logger)
    );

    // Renaming a board without authentication but with authorKey
    router.patch(
        "/boards/:boardId/:authorKey",
        param("boardId").isUUID(),
        param("authorKey").isUUID(),
        body("newTitle").isString(),
        catchAsync(async (req: Request, res: Response) => {
            try {
                const { boardId, authorKey } = req.params;
                const {newTitle} = req.body;

                const isBoardExist = await boards.isBoardExists(boardId);
                if (!isBoardExist) {
                    return res.status(404).json({ message: "Board not found" });
                }

                const isValidAuthorKey = await boards.isValidAuthorKey(boardId, authorKey);
                if (!isValidAuthorKey) {
                    return res.status(403).json({ message: "Invalid author key" });
                }

                await boards.renameBoard(boardId, newTitle);
                return res.status(204).send();
            } catch (err) {
                logger.error(err);
                return res.status(500).send("Server error");
            }
        }, logger)
    );

    // Adding an event to a board
    router.post(
        "/boards/:boardId/events",
        authenticate,
        param("boardId").isUUID(),
        body("eventId").isUUID(),
        body("eventBody").isObject(),
        catchAsync(async (req: Request, res: Response): Promise<any> => {
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
        }, logger)
    );

    // Retrieving board events
    router.get(
        "/boards/:boardId/events",
        authenticate,
        param("boardId").isUUID(),
        query("page").optional().isInt({ min: 1 }),
        query("limit").optional().isInt({ min: 1, max: 100 }),
        catchAsync(async (req: Request, res: Response): Promise<any> => {
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
        }, logger)
    );

    // Creating a link to a board for reading or editing unauthed
    router.post(
        "/boards/:boardId/links/unauthed",
        param("boardId").isUUID(),
        body("type").isIn(["edit", "view"]),
        body("authorKey").isUUID(),
        catchAsync(async (req: Request, res: Response) => {
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
        }, logger)
    );

    // Creating a link to a board for reading or editing
    router.post(
        "/boards/:boardId/links",
        authenticate,
        param("boardId").isUUID(),
        body("type").isIn(["edit", "view"]),
        catchAsync(async (req: Request, res: Response) => {
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
        }, logger)
    );

    router.get(
        "/boards/:boardId/links/:linkId/details",
        authenticate,
        param("boardId").isUUID(),
        param("linkId").isUUID(),
        catchAsync(async (req: Request, res: Response) => {
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
        }, logger)
    );

    // Remove link to a board
    router.delete(
        "/boards/:boardId/links/:linkId",
        authenticate,
        param("boardId").isUUID(),
        param("linkId").isUUID(),
        catchAsync(async (req: Request, res: Response) => {
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
        }, logger)
    );

    // Removing a visited link
    router.delete(
        "/boards/:linkId/visited",
        authenticate,
        param("linkId").isUUID(),
        catchAsync(async (req: Request, res: Response) => {
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
        }, logger)
    );

    // Get private boards
    router.get(
        "/boards/private",
        jwtMiddleware(logger),
        catchAsync(async (request, response) => {
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
        }, logger)
    );

    router.get(
        "/boards/:boardId/exists",
        param("boardId").isUUID(),
        catchAsync(async (req: Request, res: Response) => {
            try {
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    return res.status(400).json({ errors: errors.array() });
                }

                const boardId = req.params.boardId;
                let exists = await boards.isBoardExists(boardId);

                if (!exists) {
                    exists = await boards.isValidLink(boardId, ["view", "edit"]);
                }

                if (!exists) {
                    throw new Error(`Uuid ${boardId} doesnt exist`);
                }

                return res.status(200).send();
            } catch (err) {
                logger.error(`Error checking UUID existence: ${err}`);
                return res.status(404).send("Not found");
            }
        }, logger)
    );

    return router;
}
