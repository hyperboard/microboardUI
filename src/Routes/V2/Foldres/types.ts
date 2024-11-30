import type { folders } from "drizzle/entities/folders";

export type FolderPayload = typeof folders.$inferInsert;

export const FOLDER_ID_PARAM = 'folderId';