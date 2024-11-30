import { Router } from "express";
import { getBoardsRouter } from "./Boards/boards.router";
import { BoardsService } from "./Boards/boards.service";
import { getFoldersRouter } from "./Foldres/folders.router";
import { FoldersService } from "./Foldres/folders.service";
import { AccessKeysService } from "./Boards/access-keys.service";
import { catchAsync } from "shared/lib/catchAsync";
import { HttpStatus } from "shared/enums/http-status.enum";
import { HttpException } from "shared/exceptions/http-exception";

export async function getV2Router({
    boardsService,
    foldersService,
    accessKeysService,
}: {
    boardsService: BoardsService;
    foldersService: FoldersService;
    accessKeysService: AccessKeysService;
}) {
    const router = Router();
    router.use(getBoardsRouter(boardsService, foldersService, accessKeysService));
    router.use(getFoldersRouter(foldersService));

    router.all(
        "*",
        catchAsync(async (req) => {
            throw new HttpException(HttpStatus.NOT_FOUND, `Route ${req.originalUrl} not found`);
        })
    );

    return router;
}
