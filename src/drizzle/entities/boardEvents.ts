import { bigserial, integer, jsonb, pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { boards } from "./boards";

export const boardEvents = pgTable("board_events", {
    logId: bigserial("log_id", { mode: "number" }).primaryKey(),
    boardId: integer("board_id")
        .notNull()
        .references(() => boards.id, { onDelete: "cascade" }),
    eventId: varchar("event_id", { length: 32 }),
    eventBody: jsonb("event_body"),
});
