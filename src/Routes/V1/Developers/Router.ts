import { Request, Response, Router } from "express";
import { validateApiKey } from "./validateApiKey";
import { DevelopersService } from "./Service";
import { authenticate } from "../Auth/middlewares";
import { body, param, query } from "express-validator";
import { HttpStatus } from "shared/enums/http-status.enum";
import { HttpException } from "shared/exceptions/http-exception";
import { catchAsync } from "shared/lib/catchAsync";
import { BatchOperationRequest, CreateItemRequest, RefreshConfigRequest, UpdateItemRequest } from "./types";

export function getDevelopersRouter(developersService: DevelopersService) {
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
    router.use(`${routeBase}/boards`, validateApiKey);

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
        `${routeBase}/boards/:boardId/items`,
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

    // Create a new item
    router.post(
        `${routeBase}/boards/:boardId/items`,
        param("boardId").isString().notEmpty(),
        body().isObject().notEmpty(),
        catchAsync(async (req: Request<any, any, CreateItemRequest>, res: Response) => {
            const { boardId } = req.params;
            const item = await developersService.createBoardItem(boardId, req.body);
            res.status(HttpStatus.CREATED).json(item);
        })
    );

    // Update an item
    router.patch(
        `${routeBase}/boards/:boardId/items/:itemId`,
        param("boardId").isString().notEmpty(),
        param("itemId").isString().notEmpty(),
        body().isObject().notEmpty(),
        catchAsync(async (req: Request<any, any, UpdateItemRequest>, res: Response) => {
            const { boardId, itemId } = req.params;
            if (!req.sub) throw new HttpException(HttpStatus.UNAUTHORIZED, "Authentication required");

            await developersService.updateBoardItem({
                boardId,
                itemId,
                userId: +req.sub,
                operation: req.body,
            });

            const updatedItem = await developersService.getBoardItemById(boardId, itemId);
            if (!updatedItem) throw new HttpException(HttpStatus.NOT_FOUND, "Item not found");
            res.json(updatedItem);
        })
    );

    // Delete an item
    router.delete(
        `${routeBase}/boards/:boardId/items/:itemId`,
        param("boardId").isString().notEmpty(),
        param("itemId").isString().notEmpty(),
        catchAsync(async (req: Request, res: Response) => {
            const { boardId, itemId } = req.params;

            if (!req.sub) throw new HttpException(HttpStatus.UNAUTHORIZED, "Authentication required");

            await developersService.deleteBoardItem({
                boardId,
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
            const items = await developersService.batchUpdateItems(boardId, req.body.operations);
            res.json(items);
        })
    );

    // Configure item refresh
    // router.post(
    //     `${routeBase}/boards/:boardId/items/:itemId/refresh`,
    //     authenticate,
    //     param("boardId").isString().notEmpty(),
    //     param("itemId").isString().notEmpty(),
    //     body().isObject().optional(),
    //     catchAsync(async (req: Request<any, any, RefreshConfigRequest | null>, res: Response) => {
    //         const { boardId, itemId } = req.params;
    //         const item = await developersService.configureItemRefresh(boardId, itemId, req.body);
    //         res.json(item);
    //     })
    // );

    return router;
}
