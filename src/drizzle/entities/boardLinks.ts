import { pgTable, uuid, integer } from "drizzle-orm/pg-core";
import { boards } from "./boards";

export const boardEditLink = pgTable("board_edit_link", {
    boardId: integer("board_id").references(() => boards.id, { onDelete: "cascade" }),
    editLinkUUID: uuid("edit_link_uuid"),
});

export const boardViewLink = pgTable("board_view_link", {
    boardId: integer("board_id").references(() => boards.id, { onDelete: "cascade" }),
    viewLinkUUID: uuid("view_link_uuid"),
});
