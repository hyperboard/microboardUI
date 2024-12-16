import { Router } from "express";
import { validateParams } from "Middlewares";
import { validateBody } from "Middlewares/validateBody.middleware";
import { authenticate } from "Routes/V1/Auth/middlewares";
import type { FoldersService } from "../Foldres/folders.service";
import type { AccessKeysService } from "./access-keys.service";
import { getBoardsController } from "./boards.controller";
import { BoardsService } from "./boards.service";
import { authenticateBoardAuthor } from "./middlewares";
import { accessKeyUUIDSchema, boardUUIDSchema } from "./schema";
import { claimSchema } from "./schema/claim.schema";
import { createAccessKeySchema } from "./schema/create-access-key.schema";
import { createBoardSchema } from "./schema/create-board.schema";
import { grantAccessSchema } from "./schema/grant-access.schema";
import { ACCESS_KEY_PARAM, BOARD_UUID_PARAM } from "./types";
import { manageAccessSchema } from "./schema/manage-access.schema";

export function getBoardsRouter(boardsService: BoardsService, foldersService: FoldersService, accessKeysService: AccessKeysService) {
  const boardsController = getBoardsController(boardsService, foldersService, accessKeysService);

  const router = Router();

  router.post('/boards',
    authenticate(true),
    validateBody(createBoardSchema),
    boardsController.createBoard
  )

  router.post('/boards/claim',
    authenticate(),
    validateBody(claimSchema),
    boardsController.claimBoards
  )

  router.route(`/boards/:${BOARD_UUID_PARAM}`)
    .all(validateParams(boardUUIDSchema))
    .get(boardsController.getBoard)
    .patch(
      authenticateBoardAuthor(BOARD_UUID_PARAM, boardsService),
      validateBody(createBoardSchema),
      boardsController.editBoard
    )
    .delete(
      authenticateBoardAuthor(BOARD_UUID_PARAM, boardsService),
      boardsController.deleteBoard
    );

  router.route(`/boards/:${BOARD_UUID_PARAM}/grant-access`)
    .all(validateParams(boardUUIDSchema), authenticateBoardAuthor(BOARD_UUID_PARAM, boardsService))
    .post(validateBody(grantAccessSchema), boardsController.grantAccess)
    .get(boardsController.getGrantedUsers);

  router.route(`/boards/:${BOARD_UUID_PARAM}/access-key`)
    .all(validateParams(boardUUIDSchema), authenticateBoardAuthor(BOARD_UUID_PARAM, boardsService))
    .post(validateBody(createAccessKeySchema), boardsController.createAccessKey)
    .get(boardsController.getAccessKeys)

  router.route(`/boards/:${BOARD_UUID_PARAM}/access-key/:${ACCESS_KEY_PARAM}`)
    .all(
      validateParams(boardUUIDSchema),
      validateParams(accessKeyUUIDSchema),
      authenticateBoardAuthor(BOARD_UUID_PARAM, boardsService)
    )
    .get(boardsController.getAccessKey)
    .delete(boardsController.deleteAccessKey)

  router.route(`/boards/:${BOARD_UUID_PARAM}/manage-access`)
    .all(validateParams(boardUUIDSchema), authenticateBoardAuthor(BOARD_UUID_PARAM, boardsService))
    .post(validateBody(manageAccessSchema), boardsController.manageAccess)


  return router;
}