import { pgTable, uuid, jsonb, integer, timestamp, uniqueIndex, serial } from "drizzle-orm/pg-core";
import { boards } from "./boards";

export const boardSnapshots = pgTable(
    "snapshots",
    {
        id: serial("id").primaryKey(),
        boardUUID: uuid("board_id").references(() => boards.boardUUID),
        snapshot: jsonb("snapshot"),
        lastEventOrder: integer("last_event_order").notNull(),
        createdAt: timestamp("created_at").defaultNow(),
    },
    (t) => ({
        unq: uniqueIndex("board_id_last_event_order").on(t.boardUUID, t.lastEventOrder),
    })
);
