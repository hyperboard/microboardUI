import { integer, jsonb, pgTable, text, timestamp, uuid, serial } from "drizzle-orm/pg-core";
import { boards } from "./boards";

export const templates = pgTable("templates", {
    id: serial("id").primaryKey(),
    uniqId: text("uniq_id").notNull(),
    boardId: integer("board_id").references(() => boards.id, { onDelete: "cascade" }),
    name: jsonb("name").notNull(),
    description: jsonb("description").notNull(),
    created: timestamp("created").defaultNow(),
    languages: text("languages").array().notNull(),
    preview: text("preview"),
    tags: text("tags").array().notNull(),
    snapshot: jsonb("snapshot").notNull(),
});
