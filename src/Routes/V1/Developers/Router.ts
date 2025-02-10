import { Request, Response, Router } from "express";
import { validateApiKey } from "Middlewares/validateApiKey";
import { DevelopersService } from "./Service";
import { authenticate } from "../Auth/middlewares";
import { body, param, query } from "express-validator";
import { HttpStatus } from "shared/enums/http-status.enum";
import { HttpException } from "shared/exceptions/http-exception";
import { catchAsync } from "shared/lib/catchAsync";
import { BatchOperationRequest, CreateItemRequest, RefreshConfigRequest, UpdateItemRequest } from "./types";
import { Redis } from "Redis";
import winston from "winston";
import { rateLimitMiddleware } from "Middlewares/rateLimit.middleware";

export function getDevelopersRouter(developersService: DevelopersService, redis: Redis, logger: winston.Logger) {
    const router = Router();
    const routeBase = "/developers";
    // API Keys management

    router.post(
        `${routeBase}/api-keys`,
        authenticate(),
        body("name").isString().notEmpty(),
        catchAsync(async (req: Request, res: Response) => {
            console.log("TOKEN: ", req.token);
            const { sub } = req.token;

            if (!sub) throw new HttpException(HttpStatus.UNAUTHORIZED, "Authentication required");
            const apiKey = await developersService.createApiKey(+sub);
            res.status(HttpStatus.CREATED).json(apiKey);
        })
    );

    router.get(
        `${routeBase}/api-keys`,
        authenticate(),
        catchAsync(async (req: Request, res: Response) => {
            const { sub } = await req.token;
            if (!sub) throw new HttpException(HttpStatus.UNAUTHORIZED, "Authentication required");
            const keys = await developersService.listApiKeys(+sub);
            res.json(keys);
        })
    );

    router.delete(
        `${routeBase}/api-keys/:keyId`,
        authenticate(),
        param("keyId").isString().notEmpty(),
        catchAsync(async (req: Request, res: Response) => {
            const { sub } = await req.token;
            if (!sub) throw new HttpException(HttpStatus.UNAUTHORIZED, "Authentication required");
            await developersService.revokeApiKey(+sub, req.params.keyId);
            res.status(HttpStatus.NO_CONTENT).send();
        })
    );

    router.get(
        `${routeBase}/api-keys/check`,
        query("apiKey").isString().notEmpty(),
        catchAsync(async (req: Request, res: Response) => {
            const isValid = await developersService.validateApiKey(req.query.apiKey as string);
            res.json({ valid: isValid });
        })
    );

    // Board operations (protected by API key)
    router.use(`${routeBase}/boards`, validateApiKey, rateLimitMiddleware(redis, logger));

    router.get(
        `${routeBase}/boards`,
        catchAsync(async (req: Request, res: Response) => {
            if (!req.sub) throw new HttpException(HttpStatus.UNAUTHORIZED, "Authentication required");
            const boards = await developersService.listAccessibleBoards(+req.sub);
            res.json(boards);
        })
    );

    // Get all items in a board
    router.get(
        `${routeBase}/boards/:boardId/items/all`,
        param("boardId").isString().notEmpty(),
        catchAsync(async (req: Request, res: Response) => {
            const items = await developersService.getBoardItems(req.params.boardId);
            res.json(items);
        })
    );

    // Get a specific item by ID
    router.get(
        `${routeBase}/boards/:boardId/items/:itemId`,
        param("boardId").isString().notEmpty(),
        param("itemId").isString().notEmpty(),
        catchAsync(async (req: Request, res: Response) => {
            const { boardId, itemId } = req.params;
            const item = await developersService.getBoardItemById(boardId, itemId);
            if (!item) throw new HttpException(HttpStatus.NOT_FOUND, "Item not found");
            res.json(item);
        })
    );

    // Create endpoints for each item type
    const createItemEndpoint = (itemType: "Shape" | "Sticker" | "RichText" | "Frame" | "Drawing") => {
        return catchAsync(async (req: Request<any, any, Omit<CreateItemRequest, "type">>, res: Response) => {
            const { boardId } = req.params;
            const boardIntId = await developersService.getBoardId(boardId);
            const item = await developersService.createBoardItem(boardIntId, boardId, {
                ...req.body,
                type: itemType,
            });

            res.status(HttpStatus.CREATED).json(item);
        });
    };

    // Create shape
    router.post(
        `${routeBase}/boards/:boardId/shapes`,
        param("boardId").isString().notEmpty(),
        body().isObject().notEmpty(),
        createItemEndpoint("Shape")
    );

    // Create sticker
    router.post(
        `${routeBase}/boards/:boardId/stickers`,
        param("boardId").isString().notEmpty(),
        body().isObject().notEmpty(),
        createItemEndpoint("Sticker")
    );

    // Create rich text
    router.post(
        `${routeBase}/boards/:boardId/rich-texts`,
        param("boardId").isString().notEmpty(),
        body().isObject().notEmpty(),
        createItemEndpoint("RichText")
    );

    // Create frame
    router.post(
        `${routeBase}/boards/:boardId/frames`,
        param("boardId").isString().notEmpty(),
        body().isObject().notEmpty(),
        createItemEndpoint("Frame")
    );

    // Create drawing
    router.post(
        `${routeBase}/boards/:boardId/drawings`,
        param("boardId").isString().notEmpty(),
        body().isObject().notEmpty(),
        createItemEndpoint("Drawing")
    );

    // Update endpoints for each item type
    const updateItemEndpoint = (itemType: "Shape" | "Sticker" | "RichText" | "Frame" | "Drawing") => {
        return catchAsync(async (req: Request<any, any, UpdateItemRequest>, res: Response) => {
            const { boardId, itemId } = req.params;
            if (!req.sub) throw new HttpException(HttpStatus.UNAUTHORIZED, "Authentication required");

            const existingItem = await developersService.getBoardItemById(boardId, itemId);
            if (!existingItem) throw new HttpException(HttpStatus.NOT_FOUND, "Item not found");
            if (existingItem.itemType !== itemType) {
                throw new HttpException(HttpStatus.BAD_REQUEST, `Item is not a ${itemType}`);
            }
            const boardIntId = await developersService.getBoardId(boardId);

            await developersService.updateBoardItem({
                boardId: boardIntId,
                boardUUID: boardId,
                itemId,
                userId: +req.sub,
                operation: req.body,
            });

            const updatedItem = await developersService.getBoardItemById(boardId, itemId);
            if (!updatedItem) throw new HttpException(HttpStatus.NOT_FOUND, "Item not found");
            res.json(updatedItem);
        });
    };

    // Update shape
    router.patch(
        `${routeBase}/boards/:boardId/shapes/:itemId`,
        param("boardId").isString().notEmpty(),
        param("itemId").isString().notEmpty(),
        body().isObject().notEmpty(),
        updateItemEndpoint("Shape")
    );

    // Update sticker
    router.patch(
        `${routeBase}/boards/:boardId/stickers/:itemId`,
        param("boardId").isString().notEmpty(),
        param("itemId").isString().notEmpty(),
        body().isObject().notEmpty(),
        updateItemEndpoint("Sticker")
    );

    // Update rich text
    router.patch(
        `${routeBase}/boards/:boardId/rich-texts/:itemId`,
        param("boardId").isString().notEmpty(),
        param("itemId").isString().notEmpty(),
        body().isObject().notEmpty(),
        updateItemEndpoint("RichText")
    );

    // Update frame
    router.patch(
        `${routeBase}/boards/:boardId/frames/:itemId`,
        param("boardId").isString().notEmpty(),
        param("itemId").isString().notEmpty(),
        body().isObject().notEmpty(),
        updateItemEndpoint("Frame")
    );

    // Update drawing
    router.patch(
        `${routeBase}/boards/:boardId/drawings/:itemId`,
        param("boardId").isString().notEmpty(),
        param("itemId").isString().notEmpty(),
        body().isObject().notEmpty(),
        updateItemEndpoint("Drawing")
    );

    // Delete an item
    router.delete(
        `${routeBase}/boards/:boardId/items/:itemId`,
        param("boardId").isString().notEmpty(),
        param("itemId").isString().notEmpty(),
        catchAsync(async (req: Request, res: Response) => {
            const { boardId, itemId } = req.params;

            if (!req.sub) throw new HttpException(HttpStatus.UNAUTHORIZED, "Authentication required");
            const boardIntId = await developersService.getBoardId(boardId);

            await developersService.deleteBoardItem({
                boardUUID: boardId,
                boardId: boardIntId,
                itemId,
                userId: +req.sub,
            });

            res.status(HttpStatus.NO_CONTENT).send();
        })
    );

    // Batch operations
    router.post(
        `${routeBase}/boards/:boardId/items/batch`,
        param("boardId").isString().notEmpty(),
        body().isObject().notEmpty(),
        catchAsync(async (req: Request<any, any, BatchOperationRequest>, res: Response) => {
            const { boardId } = req.params;
            const boardUUID = await developersService.getBoardUuid(boardId);
            const items = await developersService.batchUpdateItems(boardId, boardUUID, req.body.operations);
            res.json(items);
        })
    );

    return router;
}
