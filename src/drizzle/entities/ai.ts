import { relations } from "drizzle-orm";
import { pgEnum, pgTable, serial, text } from "drizzle-orm/pg-core";

export const chat = pgTable("chat", {
    id: serial("id").primaryKey(),
});

const messageRole = pgEnum("role", ["ai", "user"]);
export const message = pgTable("message", {
    id: serial("id").primaryKey(),
    chatId: serial("chat_id").references(() => chat.id, { onDelete: "cascade" }),
    role: messageRole("role").notNull(),
    content: text("response").notNull().default(""),
});

// RELATIONS

export const chatRelations = relations(chat, ({ many }) => ({ messages: many(message) }));

export const messageRelations = relations(message, ({ one }) => ({
    chat: one(chat, { fields: [message.chatId], references: [chat.id] }),
}));
