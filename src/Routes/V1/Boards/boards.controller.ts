import { AccessKeyType } from "drizzle/entities/boardAccessKeys";
import type { Request } from "express";
import { HttpStatus } from "shared/enums/http-status.enum";
import { HttpException } from "shared/exceptions/http-exception";
import { catchAsync } from "shared/lib/catchAsync";
import type { FoldersService } from "../Foldres/folders.service";
import type { AccessKeysService } from "./access-keys.service";
import type { BoardsService } from "./boards.service";
import { AccessKeyDto, BoardDto, GrantedUserDto } from "./dto";
import { ACCESS_KEY_PARAM, BOARD_UUID_PARAM } from "./types";

export function getBoardsController(
    boardsService: BoardsService,
    foldersService: FoldersService,
    accessKeysService: AccessKeysService
) {
    const validateBoard = async (req: Request) => {
        const boardUUID = req.params[BOARD_UUID_PARAM];
        const board = await boardsService.get(boardUUID);

        if (!board) {
            throw new HttpException(HttpStatus.NOT_FOUND, `Board with ${boardUUID} not found`);
        }

        return board;
    };
    const createBoard = catchAsync(async (req, res) => {
        const boardOwner = req.token ? +req.token.sub : null;
        const parentFolder = +req.body.parentFolder;

        const board = await boardsService.create({ ...req.body, ownerId: boardOwner });

        if (boardOwner) {
            const rootFolder = await foldersService.getRoot(boardOwner);

            if (rootFolder) {
                await foldersService.addNestedBoard(parentFolder || rootFolder.id, board.uniqId);
                await foldersService.reorder(rootFolder.id, [
                    { order: 0, id: board.id },
                    ...rootFolder.items.map((item, idx) => ({
                        id: item.id,
                        order: idx + 1,
                    })),
                ]);
            }
        }

        res.status(HttpStatus.CREATED).json(
            new BoardDto({ ...board, authorKey: board.authorUUID, id: board.uniqId, title: board.title ?? "" })
        );
    });

    const getBoard = catchAsync(async (req, res) => {
        const board = await validateBoard(req);

        res.status(HttpStatus.OK).json(
            new BoardDto({ ...board, authorKey: null, id: board.uniqId, title: board.title ?? "" })
        );
    });

    const editBoard = catchAsync(async (req, res) => {
        const board = await validateBoard(req);
        const updatedBoard = await boardsService.edit(board.id, req.body);
        if (board.directAccessType !== updatedBoard.directAccessType || board.isPublic !== updatedBoard.isPublic) {
            await boardsService.invalidateBoardRights(board.uniqId, true);
        }

        res.status(HttpStatus.OK).json(
            new BoardDto({ ...updatedBoard, authorKey: null, id: updatedBoard.uniqId, title: updatedBoard.title ?? "" })
        );
    });

    const claimBoards = catchAsync(async (req, res) => {
        const userId = +req.token.sub;
        const authorKeys = req.body.authorKeys;
        const visitedBoards = req.body.visited;

        if (authorKeys && Array.isArray(authorKeys) && authorKeys.length > 0) {
            await boardsService.claim(authorKeys, userId);
        }

        if (visitedBoards && Array.isArray(visitedBoards) && visitedBoards.length > 0) {
            await boardsService.visit(visitedBoards, userId);
        }

        res.status(HttpStatus.NO_CONTENT).send();
    });

    const deleteBoard = catchAsync(async (req, res) => {
        const boardUUID = req.params[BOARD_UUID_PARAM];

        await boardsService.remove(boardUUID);

        res.status(HttpStatus.NO_CONTENT).send();
    });

    const createAccessKey = catchAsync(async (req, res) => {
        const board = await validateBoard(req);
        const keyType = req.body.keyType as AccessKeyType;
        const accessKey = await accessKeysService.createAccessKey(board.id, keyType);

        res.status(HttpStatus.CREATED).json(
            new AccessKeyDto({
                boardId: board.uniqId,
                keyType: accessKey.keyType,
                accessKey: accessKey.keyUUID,
            })
        );
    });

    const getAccessKeys = catchAsync(async (req, res) => {
        const board = await validateBoard(req);

        const accessKeys = await accessKeysService.getAccessKeys(board.id);

        res.json(
            accessKeys.map(
                (k) =>
                    new AccessKeyDto({
                        boardId: board.uniqId,
                        keyType: k.keyType,
                        accessKey: k.keyUUID,
                    })
            )
        );
    });

    const getAccessKey = catchAsync(async (req, res) => {
        const board = await validateBoard(req);
        const keyUUID = req.params[ACCESS_KEY_PARAM];
        const accessKey = await accessKeysService.getAccessKey(board.id, keyUUID);

        res.json(
            new AccessKeyDto({
                boardId: board.uniqId,
                keyType: accessKey.keyType,
                accessKey: accessKey.keyUUID,
            })
        );
    });

    const deleteAccessKey = catchAsync(async (req, res) => {
        const board = await validateBoard(req);
        const keyUUID = req.params[ACCESS_KEY_PARAM];

        await accessKeysService.deleteAccessKey(board.id, keyUUID);

        res.status(HttpStatus.NO_CONTENT).send();
    });

    const grantAccess = catchAsync(async (req, res) => {
        const board = await validateBoard(req);
        await boardsService.grantAccess(board.id, req.body.users);
        await boardsService.invalidateBoardRights(board.uniqId, true);

        res.status(HttpStatus.NO_CONTENT).send();
    });

    const manageAccess = catchAsync(async (req, res) => {
        const board = await validateBoard(req);
        if (req.body.users) {
            await boardsService.grantAccess(board.id, req.body.users);
        }

        if (req.body.directAccessType || typeof req.body.isPublic === "boolean") {
            await boardsService.edit(board.id, {
                directAccessType: req.body.directAccessType,
                isPublic: req.body.isPublic,
            });
        }

        await boardsService.invalidateBoardRights(board.uniqId, true);

        res.status(HttpStatus.NO_CONTENT).send();
    });

    const getGrantedUsers = catchAsync(async (req, res) => {
        const board = await validateBoard(req);
        const users = await boardsService.getGrantedUsers(board.id);

        res.json(users.map((i) => new GrantedUserDto(i)));
    });

    return {
        createBoard,
        getBoard,
        editBoard,
        claimBoards,
        deleteBoard,
        createAccessKey,
        getAccessKeys,
        getAccessKey,
        deleteAccessKey,
        grantAccess,
        getGrantedUsers,
        manageAccess,
    };
}
