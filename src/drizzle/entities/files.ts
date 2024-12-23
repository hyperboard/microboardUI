import { integer, pgTable, serial, text, uuid, vector } from "drizzle-orm/pg-core";
import { boards } from "./boards";

export const files = pgTable("files", {
    id: serial("id").primaryKey(),
    embedding: vector("embedding", { dimensions: 1536 }),
    link: text("link").notNull(),
    boardId: uuid("board_id").references(() => boards.uniqId, { onDelete: "cascade" }),
});
