import { boolean, integer, pgEnum, pgTable, primaryKey, serial, text, uniqueIndex } from "drizzle-orm/pg-core";
import { users } from "./users";
import { boards } from "./boards";
import { enumToPgEnum } from "shared/lib/enumToPgEnum";
import { boardAccessKeys } from "./boardAccessKeys";

export enum FolderType {
  ROOT = 'root',
  NESTED = 'nested',
  VISITED = 'visited',
  TRASH = 'trash',
  DRAFTS = 'drafts'
}

export const folderType = pgEnum('folder_type', enumToPgEnum(FolderType));

export const folders = pgTable('folders', {
  id: serial('id').primaryKey(),
  title: text('title').notNull().default(''),
  ownerId: integer('owner_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  type: folderType('type').notNull().default(FolderType.NESTED),
  deleted: boolean('deleted').notNull().default(false),
});

export const foldersToFolders = pgTable('folders_to_folders', {
  id: serial('id').primaryKey(),
  folderId: integer('folder_id').references(() => folders.id, { onDelete: 'cascade' }),
  containsFolderId: integer('contains_folder_id').references(() => folders.id, { onDelete: 'cascade' }),
  order: integer('order'),
}, (t) => ({
  unq: uniqueIndex('folder_id_contains_folder_id_idx').on(t.folderId, t.containsFolderId)
}));

export const foldersToBoards = pgTable('folders_to_boards', {
  id: serial('id').primaryKey(),
  folderId: integer('folder_id').references(() => folders.id, { onDelete: 'cascade' }),
  containsBoardId: integer('contains_border_id').references(() => boards.id, { onDelete: 'cascade' }),
  accessKey: integer('access_key').references(() => boardAccessKeys.id, { onDelete: 'cascade' }),
  order: integer('order'),
}, (t) => ({
  unq: uniqueIndex('folder_id_contains_board_id_idx').on(t.folderId, t.containsBoardId)
}));


