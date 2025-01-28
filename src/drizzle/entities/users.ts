import { relations, sql } from "drizzle-orm";
import { pgTable, varchar, serial, boolean, timestamp } from "drizzle-orm/pg-core";
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
}));
