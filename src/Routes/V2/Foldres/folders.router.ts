import { Router } from "express";
import { validateBody, validateParams, validateQuery } from "Middlewares";
import { getFoldersController } from "./folders.controller";
import { FoldersService } from "./folders.service";
import { folderPayloadSchema } from "./schema/create-folder.schema";
import { authenticate } from "Routes/V1/Auth/middlewares";
import { rootFolderQuerySchema } from "./schema/root-folder-query.schema";
import { folderParamsSchema } from "./schema/folder-params.schema";
import { FOLDER_ID_PARAM } from "./types";

export function getFoldersRouter(foldersService: FoldersService) {
  const foldersController = getFoldersController(foldersService);

  const router = Router();

  router.route('/folders')
    .all(authenticate())
    .post(
      validateBody(folderPayloadSchema),
      foldersController.create
    )
    .get(
      validateQuery(rootFolderQuerySchema),
      foldersController.getRoot
    );

  router.post('/folders/init', authenticate(), foldersController.init)

  router.route(`/folders/:${FOLDER_ID_PARAM}`)
    .all(authenticate(), validateParams(folderParamsSchema))
    .get(foldersController.get)
    .post(foldersController.addContent)
    .delete(foldersController.remove)
    .patch(foldersController.edit);


  return router;
}