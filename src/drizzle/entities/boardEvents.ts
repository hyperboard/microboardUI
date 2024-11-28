import { bigint, bigserial, index, integer, jsonb, pgTable, primaryKey, serial, varchar } from "drizzle-orm/pg-core";
import { boards } from "./boards";

/*
BEFORE
export const boardEvents = pgTable("board_events", {
    logId: bigserial("log_id", { mode: "number" }).primaryKey(),
    boardId: integer("board_id")
        .notNull()
        .references(() => boards.id, { onDelete: "cascade" }),
    eventId: varchar("event_id", { length: 32 }),
    eventBody: jsonb("event_body"),
});
*/

export const boardEvents = pgTable(
    "board_events",
    {
        boardId: integer("board_id")
            .notNull()
            .references(() => boards.id, { onDelete: "cascade" }),
        logId: bigint("log_id", { mode: "number" }).notNull(),
        eventId: varchar("event_id", { length: 32 }),
        eventBody: jsonb("event_body"),
    },
    (table) => {
        return {
            pk: primaryKey({ columns: [table.boardId, table.logId] }),
            boardIdLogIdIdx: index("board_id_log_id_idx").on(table.boardId, table.logId),
        };
    }
);
