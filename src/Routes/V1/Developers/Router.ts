import { Request, Response, Router } from "express";
import { validateApiKey } from "Middlewares/validateApiKey";
import { DevelopersService } from "./Service";
import { authenticate } from "../Auth/middlewares";
import { body, param, query } from "express-validator";
import { HttpStatus } from "shared/enums/http-status.enum";
import { HttpException } from "shared/exceptions/http-exception";
import { catchAsync } from "shared/lib/catchAsync";
import {
    BatchOperationRequest,
    CreateItemRequest,
    UpdateItemRequest,
    UpdateShapeRequest,
    UpdateStickerRequest,
    UpdateRichTextRequest,
    UpdateFrameRequest,
    UpdateDrawingRequest,
} from "./types";
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
    const createItemEndpoint = <T extends CreateItemRequest["type"]>(itemType: T) => {
        return catchAsync(async (req: Request<any, any, any>, res: Response) => {
            const { boardId } = req.params;
            const boardIntId = await developersService.getBoardId(boardId);

            // Type assertion to ensure type safety
            const createRequest = {
                ...req.body,
                type: itemType,
            } as CreateItemRequest;

            const item = await developersService.createBoardItem(boardIntId, boardId, createRequest);
            res.status(HttpStatus.CREATED).json(item);
        });
    };

    // Create shape
    router.post(
        `${routeBase}/boards/:boardId/shapes`,
        param("boardId").isString().notEmpty(),
        body().isObject().notEmpty(),
        createItemEndpoint("Shape" as const)
    );

    // Create sticker
    router.post(
        `${routeBase}/boards/:boardId/stickers`,
        param("boardId").isString().notEmpty(),
        body().isObject().notEmpty(),
        createItemEndpoint("Sticker" as const)
    );

    // Create rich text
    router.post(
        `${routeBase}/boards/:boardId/rich-texts`,
        param("boardId").isString().notEmpty(),
        body().isObject().notEmpty(),
        createItemEndpoint("RichText" as const)
    );

    // Create frame
    router.post(
        `${routeBase}/boards/:boardId/frames`,
        param("boardId").isString().notEmpty(),
        body().isObject().notEmpty(),
        createItemEndpoint("Frame" as const)
    );

    // Create drawing
    router.post(
        `${routeBase}/boards/:boardId/drawings`,
        param("boardId").isString().notEmpty(),
        body().isObject().notEmpty(),
        createItemEndpoint("Drawing" as const)
    );

    router.post(
        `${routeBase}/boards/:boardId/images`,
        param("boardId").isString().notEmpty(),
        body().isObject().notEmpty(),
        createItemEndpoint("Image" as const)
    );

    router.post(
        `${routeBase}/boards/:boardId/events`,
        param("boardId").isString().notEmpty(),
        body("events").isArray(),
        catchAsync(async (req: Request, res: Response) => {
            console.log("EVENTS: ", req.body);
            const { boardId } = req.params;
            const { events } = req.body;

            if (
                !Array.isArray(events) ||
                !events.every(
                    (event) =>
                        event.userId &&
                        event.boardId &&
                        event.operation &&
                        typeof event.operation === "object" &&
                        event.operation.class &&
                        event.operation.method
                )
            ) {
                console.log("INVALID EVENTS FORMAT");
                throw new HttpException(HttpStatus.BAD_REQUEST, "Invalid events format");
            }

            await developersService.saveBoardEvents(boardId, events);
            res.status(HttpStatus.NO_CONTENT).send();
        })
    );

    // Update endpoints for each item type
    const updateItemEndpoint = <T extends UpdateItemRequest>(
        itemType: "Shape" | "Sticker" | "RichText" | "Frame" | "Drawing"
    ) => {
        return catchAsync(async (req: Request<any, any, T>, res: Response) => {
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
        updateItemEndpoint<UpdateShapeRequest>("Shape")
    );

    // Update sticker
    router.patch(
        `${routeBase}/boards/:boardId/stickers/:itemId`,
        param("boardId").isString().notEmpty(),
        param("itemId").isString().notEmpty(),
        body().isObject().notEmpty(),
        updateItemEndpoint<UpdateStickerRequest>("Sticker")
    );

    // Update rich text
    router.patch(
        `${routeBase}/boards/:boardId/rich-texts/:itemId`,
        param("boardId").isString().notEmpty(),
        param("itemId").isString().notEmpty(),
        body().isObject().notEmpty(),
        updateItemEndpoint<UpdateRichTextRequest>("RichText")
    );

    // Update frame
    router.patch(
        `${routeBase}/boards/:boardId/frames/:itemId`,
        param("boardId").isString().notEmpty(),
        param("itemId").isString().notEmpty(),
        body().isObject().notEmpty(),
        updateItemEndpoint<UpdateFrameRequest>("Frame")
    );

    // Update drawing
    router.patch(
        `${routeBase}/boards/:boardId/drawings/:itemId`,
        param("boardId").isString().notEmpty(),
        param("itemId").isString().notEmpty(),
        body().isObject().notEmpty(),
        updateItemEndpoint<UpdateDrawingRequest>("Drawing")
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
