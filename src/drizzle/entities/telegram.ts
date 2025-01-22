import { pgTable } from "drizzle-orm/pg-core";
import { text, timestamp, uuid } from "drizzle-orm/pg-core";

export const telegramChats = pgTable("telegram_chats", {
    id: uuid("id").defaultRandom().primaryKey(),
    chatId: text("chat_id").notNull().unique(), // Telegram chat ID
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
