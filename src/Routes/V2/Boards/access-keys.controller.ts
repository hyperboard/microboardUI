import { HttpStatus } from "shared/enums/http-status.enum";
import { HttpException } from "shared/exceptions/http-exception";
import { catchAsync } from "shared/lib/catchAsync";
import type { FoldersService } from "../Foldres/folders.service";
import type { AccessKeysService } from "./access-keys.service";
import type { BoardsService } from "./boards.service";
import { BoardDto } from "./dto";
import { BOARD_UUID_PARAM } from "./middlewares";

export function getBoardsController(boardsService: BoardsService, foldersService: FoldersService, accessKeysService: AccessKeysService) {
  const createBoard = catchAsync(async (req, res) => {
    const boardOwner = req.token ? +req.token.sub : null;
    const parentFolder = +req.body.parentFolder;
    
    const board = await boardsService.create({ ...req.body, ownerId: boardOwner });

    if (boardOwner) {
      const rootFolder = await foldersService.getRoot(boardOwner);

      if (rootFolder) {
        await foldersService.addNestedBoard(parentFolder || rootFolder.id, board.uniqId);
      }
    }

    res
      .status(HttpStatus.CREATED)
      .json(new BoardDto({ ...board, authorKey: board.authorUUID, id: board.uniqId }));
  });

  const getBoard = catchAsync(async (req, res) => {
    const boardUUID = req.params[BOARD_UUID_PARAM];

    const board = await boardsService.get(boardUUID);

    if (!board) {
      throw new HttpException(HttpStatus.NOT_FOUND, `Board with ${boardUUID} not found`);
    }

    res
      .status(HttpStatus.OK)
      .json(new BoardDto({ ...board, authorKey: null, id: board.uniqId }))
  });

  const editBoard = catchAsync(async (req, res) => {
    const boardUUID = req.params[BOARD_UUID_PARAM];
    const board = await boardsService.get(boardUUID);

    if (!board) {
      throw new HttpException(HttpStatus.NOT_FOUND, `Board with ${boardUUID} not found`);
    }

    const updatedBoard = await boardsService.edit(board.id, req.body);

    res
      .status(HttpStatus.OK)
      .json(new BoardDto({ ...updatedBoard, authorKey: null, id: updatedBoard.uniqId }));
  })

  const claimBoards = catchAsync(async (req, res) => {
    const userId = +req.token.sub;
    const authorKeys = req.body.authorKeys;

    if (authorKeys && Array.isArray(authorKeys) && authorKeys.length > 0) {
      await boardsService.claim(authorKeys, userId);
    }

    res.status(HttpStatus.NO_CONTENT).send();
  });

  const createAccessKey = catchAsync(async (req, res) => {
    
  })

  const deleteBoard = catchAsync(async (req, res) => {
    const boardUUID = req.params.boardUUID;

    await boardsService.remove(boardUUID);

    res.status(HttpStatus.NO_CONTENT).send();
  });

  return {
    createBoard,
    getBoard,
    editBoard,
    claimBoards,
    createAccessKey,
    deleteBoard
  }
}
