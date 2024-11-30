import type { boards } from "drizzle/entities";

export type BoardPayload = typeof boards.$inferInsert;