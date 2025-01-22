import type { folders } from "drizzle/entities/folders";
import type { z } from "zod";
import type { reorderFolderSchema } from "./schema/reorder-folder.schema";

export type FolderPayload = typeof folders.$inferInsert;

export const FOLDER_ID_PARAM = "folderId";

export type FolderItems = z.infer<typeof reorderFolderSchema.shape.items>;
