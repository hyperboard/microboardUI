import { pgTable, varchar, serial, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    email: varchar("email", { length: 254 }), // TODO: make unique
    activated: boolean("activated").default(false),
    refreshToken: varchar("refresh_token"),
});
