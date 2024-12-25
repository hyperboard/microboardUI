import { relations } from "drizzle-orm";
import { pgTable, varchar, serial, boolean } from "drizzle-orm/pg-core";
import { boards } from "./boards";

export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    email: varchar("email", { length: 254 }).unique().notNull(),
    activated: boolean("activated").default(false),
    refreshToken: varchar("refresh_token"),
});

export const userRelations = relations(users, ({ one, many }) => ({
    boards: many(boards),
}));
