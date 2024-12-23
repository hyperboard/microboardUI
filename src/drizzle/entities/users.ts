import { relations } from "drizzle-orm";
import { pgTable, varchar, serial, boolean, timestamp } from "drizzle-orm/pg-core";
import { tariffTypes } from "./tariffs";
import { boards } from "./boards";

export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    email: varchar("email", { length: 254 }).unique().notNull(),
    activated: boolean("activated").default(false),
    refreshToken: varchar("refresh_token"),
    currentTariffId: varchar("current_tariff_id").references(() => tariffTypes.id),
    tariffStartDate: timestamp("tariff_start_date"),
});

export const userRelations = relations(users, ({ one, many }) => ({
    currentTariff: one(tariffTypes, {
        fields: [users.currentTariffId],
        references: [tariffTypes.id],
    }),
    boards: many(boards),
}));
