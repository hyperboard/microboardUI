import type { NextFunction, Request, Response } from "express";
import { HttpStatus } from "shared/enums/http-status.enum";
import { HttpException } from "shared/exceptions/http-exception";
import { catchAsync } from "shared/lib/catchAsync";
import type { BoardsService } from "../boards.service";
import { validate } from "uuid";
import { checkPermissions } from "Routes/V1/Auth/middlewares/has-permission.middleware";
import { verifyToken } from "Tokens";

export const BOARD_AUTHOR_KEY_HEADER = "x-author-key";

export function authenticateBoardAuthor(boardUUIDParam: string, boardsService: BoardsService) {
    return catchAsync(async (req: Request, _: Response, next: NextFunction) => {
        const authorKey = req.headers[BOARD_AUTHOR_KEY_HEADER];
        const boardUUID = req.params[boardUUIDParam];

        if (
            authorKey &&
            !Array.isArray(authorKey) &&
            validate(authorKey) &&
            boardUUID &&
            (await boardsService.validateAuthor(boardUUID, authorKey))
        ) {
            return next();
        }

        const accessTokenHeader = req.headers.authorization;
        const accessToken = accessTokenHeader?.split(" ")[1] ?? "";

        const decodedToken = await verifyToken(accessToken, "access");

        if (decodedToken && checkPermissions(decodedToken, "owns", "boards", boardUUID)) {
            return next();
        }

        if (!decodedToken) {
            throw new HttpException(HttpStatus.UNAUTHORIZED, "Invalid author key or boardId");
        } else {
            throw new HttpException(HttpStatus.FORBIDDEN, "Not enough rights");
        }
    });
}
