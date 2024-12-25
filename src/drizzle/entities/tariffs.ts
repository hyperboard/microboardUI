import { boolean, integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { users } from "./users";

export const tariffPlans = pgTable("tariff_plans", {
    id: varchar("id").primaryKey(),
    name: varchar("name").notNull(),
    description: varchar("description"),
    monthlyTokenLimit: integer("monthly_token_limit").notNull(),
    resetPeriodDays: integer("reset_period_days"),
    price: integer("price"), // в копейках
    version: integer("version").notNull().default(1),
});

export const userTariffs = pgTable("user_tariffs", {
    id: varchar("id").primaryKey(),
    userId: integer("user_id")
        .references(() => users.id)
        .notNull(),
    tariffId: varchar("tariff_id")
        .references(() => tariffPlans.id)
        .notNull(),
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date").notNull(),
    status: varchar("status").notNull().default("active"), // active, cancelled, expired
    canceledAt: timestamp("canceled_at"),
});

// export const tokenUsages = pgTable("token_usages", {
//     id: varchar("id").primaryKey(),
//     userId: integer("user_id")
//         .references(() => users.id)
//         .notNull(),
//     tariffTypeId: varchar("tariff_type_id")
//         .references(() => tariffPlans.id)
//         .notNull(),
//     tokensUsed: integer("tokens_used").default(0),
//     periodStart: timestamp("period_start").notNull(),
//     periodEnd: timestamp("period_end").notNull(),
//     resetAt: timestamp("reset_at"),
//     isCurrent: boolean("is_current").default(true),
// });

export type TariffPlan = typeof tariffPlans.$inferSelect;
export type UserTariff = typeof userTariffs.$inferSelect;
// export type TokenUsage = typeof tokenUsages.$inferSelect;
