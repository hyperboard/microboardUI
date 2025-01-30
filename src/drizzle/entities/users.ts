import { relations, sql } from "drizzle-orm";
import { pgTable, varchar, serial, boolean, integer, timestamp } from "drizzle-orm/pg-core";
import { boards } from "./boards";
import { check } from "drizzle-orm/pg-core";

export const users = pgTable(
    "users",
    {
        id: serial("id").primaryKey(),
        email: varchar("email", { length: 254 }).unique(),
        address: varchar("crypto_wallet").unique(),
        activated: boolean("activated").default(false),
        refreshToken: varchar("refresh_token"),
        newsletter: boolean("newsletter").default(true),
        createdAt: timestamp("created_at").defaultNow(),
    },
    (table) => ({
        emailOrAddressNotNull: check(
            "email_or_address_not_null",
            sql`${table.email} IS NOT NULL OR ${table.address} IS NOT NULL`
        ),
    })
);

export const userRelations = relations(users, ({ one, many }) => ({
    boards: many(boards),
    apiKeys: many(apiKeys),
}));

export const apiKeys = pgTable("api_keys", {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
        .notNull()
        .references(() => users.id),
    key: varchar("key", { length: 255 }).notNull(),
    name: varchar("name", { length: 100 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    lastUsedAt: timestamp("last_used_at"),
});

export const apiKeyRelations = relations(apiKeys, ({ one }) => ({
    user: one(users, {
        fields: [apiKeys.userId],
        references: [users.id],
    }),
}));

export type ApiKey = typeof apiKeys.$inferSelect & {
    message?: string;
};
