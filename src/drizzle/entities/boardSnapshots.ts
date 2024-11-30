import { integer, jsonb, pgTable, serial, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { boards } from "./boards";

export const boardSnapshots = pgTable(
    "board_snapshots",
    {
        id: serial("id").primaryKey(),
        boardId: integer("board_id").references(() => boards.id),
        snapshot: jsonb("snapshot"),
        lastEventOrder: integer("last_event_order").notNull(),
        createdAt: timestamp("created_at").defaultNow(),
    },
    (t) => ({
        unq: uniqueIndex("board_id_last_event_order").on(t.boardId, t.lastEventOrder),
    })
);
