import { FolderType } from "drizzle/entities/folders";
import { z } from "zod";

export const rootFolderQuerySchema = z.object({
  type: z.nativeEnum(FolderType).optional()
});