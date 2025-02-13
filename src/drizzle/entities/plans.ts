import { boolean, integer, pgTable, serial, text, timestamp, unique, uuid, varchar } from "drizzle-orm/pg-core";
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
    annualPrice: integer("annual_price").notNull(),
    version: integer("version").notNull().default(1),
    storageLimit: integer("storage_limit").notNull(), // in bytes (100MB or 100GB)
    textToSpeech: integer("text_to_speech_limit").notNull(), // in symbols (0 or 15_000)
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
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    stripeSubscriptionId: varchar("stripe_subscription_id"),
    transactionHash: varchar("transaction_hash"),
    annualPayment: boolean("is_annual").notNull().default(false),
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
    chainName: varchar("crypto_chain").notNull(), // Ethereum, polygon, ...
    addressFrom: varchar("crypto_wallet").notNull(),
    valueWei: varchar("crypto_price").notNull(),
    annualPayment: boolean("is_annual").notNull().default(false),
    transactionHash: varchar("transaction_hash"),
});

export const walletLastCheckedBlock = pgTable(
    "wallet_last_checked_block",
    {
        id: varchar("id").primaryKey(),
        address: varchar("crypto_wallet").notNull(),
        chainName: varchar("crypto_chain").notNull(), // ethereum, polygon, ...
        lastBlockNumber: integer("last_block_number").default(0),
    },
    (t) => ({
        uniqueAddressChain: unique().on(t.address, t.chainName),
    })
);

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

export const userStorageUsage = pgTable("user_storage_usage", {
    id: varchar("id").primaryKey(),
    userId: integer("user_id")
        .references(() => users.id)
        .notNull(),
    totalBytes: integer("total_bytes").notNull().default(0),
    lastUpdated: timestamp("last_updated").notNull(),
});

export const customPlanRequests = pgTable("custom_plan_requests", {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
        .references(() => users.id)
        .notNull(),
    status: varchar("status").notNull().default("pending"), // pending, rejected, approved
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Plan = typeof plans.$inferSelect;
export type UserPlan = typeof userPlans.$inferSelect;
export type AiModel = typeof aiModels.$inferSelect;
export type ModelLimit = typeof modelLimits.$inferSelect;
