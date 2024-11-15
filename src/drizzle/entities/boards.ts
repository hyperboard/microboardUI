import { boolean, integer, pgTable, serial, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";

export const boards = pgTable("boards", {
    id: serial("id").primaryKey(),
    boardUUID: uuid("uniq_id").notNull().defaultRandom().unique(),
    created: timestamp("created").defaultNow(),
    boardName: text("boardname"),
    authorUUID: uuid("author_key"),
    isPublic: boolean("is_public").notNull().default(false),
});

export const userBoardId = pgTable("user_board_id", {
    userId: integer("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    boardUuid: uuid("board_uuid"),
});
