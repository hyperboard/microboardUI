import { z } from "zod";
import { FOLDER_ID_PARAM } from "../types";

export const folderParamsSchema = z.object({
  [FOLDER_ID_PARAM]: z.preprocess(
    (v) => Number(v),
    z.number().int().transform(Number),
  )
});