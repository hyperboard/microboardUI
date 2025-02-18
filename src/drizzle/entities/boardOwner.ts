import { pgTable, integer, primaryKey } from "drizzle-orm/pg-core";
import { boards } from "./boards";
import { users } from "./users";

export const boardOwner = pgTable(
    "board_owner",
    {
        boardId: integer("board_id")
            .references(() => boards.id, { onDelete: "cascade" })
            .notNull(),
        ownerId: integer("owner_id")
            .references(() => users.id, { onDelete: "cascade" })
            .notNull(),
    },
    (t) => ({
        pk: primaryKey({ columns: [t.boardId, t.ownerId] }),
    })
);
