import { boolean, integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { users } from "./users";

export const tariffTypes = pgTable("tariff_types", {
    id: varchar("id").primaryKey(),
    name: varchar("name").notNull(),
    monthlyTokenLimit: integer("monthly_token_limit").notNull(),
    isFreeTariff: boolean("is_free_tariff").default(false),
    resetPeriodDays: integer("reset_period_days"), // New column to define reset period dynamically
});

export const tokenUsages = pgTable("token_usages", {
    id: varchar("id").primaryKey(),
    userId: integer("user_id")
        .references(() => users.id)
        .notNull(),
    tariffTypeId: varchar("tariff_type_id")
        .references(() => tariffTypes.id)
        .notNull(),
    tokensUsed: integer("tokens_used").default(0),
    periodStart: timestamp("period_start").notNull(),
    periodEnd: timestamp("period_end").notNull(), // Ensure a defined end
    isCurrent: boolean("is_current").default(true),
});
