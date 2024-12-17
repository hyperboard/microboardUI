import { relations } from "drizzle-orm";
import { boolean, integer, pgTable, serial, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { boards } from "./boards";

export const chat = pgTable("chat", {
    id: serial("id").primaryKey(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    active: boolean("active").default(true).notNull(),
    boardId: text("board_id").notNull(),
});

export const message = pgTable("message", {
    id: serial("id").primaryKey(),
    chatId: integer("chat_id").references(() => chat.id, { onDelete: "cascade" }),
    role: text("role").notNull(),
    content: text("content").notNull().default(""),
    tokensUsed: integer("tokens_used").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    archived: boolean("archived").default(false).notNull(),
    status: text("status").notNull().default("pending"),
    updatedFrom: integer("updated_from"),
    generatedFrom: integer("generated_from"),
});

export const chatRelations = relations(chat, ({ many }) => ({
    messages: many(message),
}));

export const messageRelations = relations(message, ({ one }) => ({
    chat: one(chat, { fields: [message.chatId], references: [chat.id] }),
}));

export type Chat = typeof chat.$inferSelect;
export type Message = typeof message.$inferSelect;
export type NewChat = typeof chat.$inferInsert;
export type NewMessage = typeof message.$inferInsert;

export enum MessageStatus {
    PENDING = "pending",
    ARCHIVED = "archived",
    INTERRUPTED = "interrupted",
}

export enum MessageRole {
    USER = "user",
    ASSISTANT = "assistant",
    SYSTEM = "system",
}
