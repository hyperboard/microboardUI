import { boolean, integer, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { users } from "./users";

export const aiModels = pgTable("ai_models", {
    id: varchar("id").primaryKey(),
    name: varchar("name").notNull(),
    displayName: varchar("display_name").notNull(),
    isDefault: boolean("is_default").default(false).notNull(),
});

export const plans = pgTable("plans", {
    id: varchar("id").primaryKey(),
    name: varchar("name").notNull(),
    description: varchar("description"),
    monthlyTokenLimit: integer("monthly_token_limit").notNull(),
    resetPeriodDays: integer("reset_period_days"),
    price: integer("price").notNull(), // in kopeck
    version: integer("version").notNull().default(1),
    storageLimit: integer("storage_limit").notNull(), // in bytes (100MB or 100GB)
    isActive: boolean("is_active").notNull().default(true),
});

export const userPlans = pgTable("user_plans", {
    id: varchar("id").primaryKey(),
    userId: integer("user_id")
        .references(() => users.id)
        .notNull(),
    planId: varchar("plan_id")
        .references(() => plans.id)
        .notNull(),
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date").notNull(),
    status: varchar("status").notNull().default("active"), // active, cancelled, expired
    canceledAt: timestamp("canceled_at"),
    stripeSubscriptionId: varchar("stripe_subscription_id"),
    transactionHash: varchar("transaction_hash"),
});

export const userCryptoCheckout = pgTable("user_crypto_checkout", {
    id: varchar("id").primaryKey(),
    userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
    planId: varchar("plan_id")
    .references(() => plans.id)
    .notNull(),
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date").notNull(),
    status: varchar("status").notNull().default("active"), // active, cancelled, expired, payed 
    symbol: varchar("crypto_symbol").notNull(), // ETH, POL, ...
    chainName: varchar("crypto_chain").notNull(), // Ethereum, Polygon, ...
    addressFrom: varchar("crypto_wallet").notNull(),
    valueWei: varchar("crypto_price").notNull(),
    transactionHash: varchar("transaction_hash"),
});

export const modelLimits = pgTable("plan_model_limits", {
    id: text("id").primaryKey(),
    planId: varchar("plan_id")
        .references(() => plans.id)
        .notNull(),
    modelId: varchar("model_id")
        .references(() => aiModels.id)
        .notNull(),
    dailyRequestLimit: integer("daily_request_limit"), // null means unlimited
    weeklyRequestLimit: integer("weekly_request_limit"), // null means unlimited
    isEnabled: boolean("is_enabled").notNull().default(true),
    planVersion: integer("plan_version").notNull().default(1),
});

export const userModelUsage = pgTable("user_model_usage", {
    id: varchar("id").primaryKey(),
    userId: integer("user_id")
        .references(() => users.id)
        .notNull(),
    modelId: varchar("model_id")
        .references(() => aiModels.id)
        .notNull(),
    requestCount: integer("request_count").notNull().default(0),
    periodStart: timestamp("period_start").notNull(),
    periodEnd: timestamp("period_end").notNull(),
    periodType: varchar("period_type").notNull(), // 'daily' or 'weekly'
});

export const userStorageUsage = pgTable("user_storage_usage", {
    id: varchar("id").primaryKey(),
    userId: integer("user_id")
        .references(() => users.id)
        .notNull(),
    totalBytes: integer("total_bytes").notNull().default(0),
    lastUpdated: timestamp("last_updated").notNull(),
});

export type Plan = typeof plans.$inferSelect;
export type UserPlan = typeof userPlans.$inferSelect;
export type AiModel = typeof aiModels.$inferSelect;
export type ModelLimit = typeof modelLimits.$inferSelect;
export type UserModelUsage = typeof userModelUsage.$inferSelect;
