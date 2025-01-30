import winston from "winston";
import { db } from "drizzle/db";
import { telegramChats } from "drizzle/entities";
import { eq } from "drizzle-orm";
import { sleep } from "openai/core";
import { AiChatMsg } from "WebSocket/ai-chat";

export interface TelegramServiceConfig {
    token: string;
    appToken: string;
    isEnabled?: boolean;
    logger: winston.Logger;
}

export class TelegramService {
    private readonly isEnabled: boolean;
    private baseUrl: string;
    private logger: winston.Logger;
    private appToken: string;

    constructor(private readonly config: TelegramServiceConfig) {
        this.baseUrl = `https://api.telegram.org/bot${this.config.token}`;
        this.logger = config.logger;
        this.appToken = this.config.appToken;
        this.isEnabled = this.config.isEnabled ?? true;
    }

    private async sendTelegramRequest(method: string, params: any = {}) {
        if (!this.isEnabled) {
            this.logger.debug(`Telegram disabled: skipping ${method} request`);
            return { ok: true, result: [] };
        }
        try {
            const response = await fetch(`${this.baseUrl}/${method}`, {
                method: params ? "POST" : "GET",
                headers: params ? { "Content-Type": "application/json" } : undefined,
                body: params ? JSON.stringify(params) : undefined,
            });

            if (!response.ok) {
                throw new Error(`Telegram API error: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            this.logger.error(`Telegram API request failed (${method}):`, error);
            throw error;
        }
    }

    private async setupCommands() {
        const commands = [
            { command: "start", description: "Start the bot" },
            { command: "subscribe", description: "Subscribe to error reports" },
            { command: "unsubscribe", description: "Unsubscribe from error reports" },
        ];

        try {
            await this.sendTelegramRequest("setMyCommands", { commands });
            this.logger.info("Bot commands set successfully");
        } catch (error) {
            this.logger.error("Failed to set bot commands:", error);
        }
    }

    private async handleUpdate(update: any) {
        if (!update.message?.text || !update.message?.chat?.id) return;

        const chatId = update.message.chat.id.toString();
        const text = update.message.text;
        const [command, ...args] = text.split(" ");

        switch (command) {
            case "/start":
                await this.sendTelegramRequest("sendMessage", {
                    chat_id: chatId,
                    text: "Hello! Use /subscribe <app-token> to subscribe to error reports.",
                });
                break;

            case "/subscribe":
                const token = args[0];
                if (!token) {
                    await this.sendTelegramRequest("sendMessage", {
                        chat_id: chatId,
                        text: "Please provide an app token: /subscribe <app-token>",
                    });
                    return;
                }

                if (token !== this.appToken) {
                    await this.sendTelegramRequest("sendMessage", {
                        chat_id: chatId,
                        text: "Invalid app token",
                    });
                    return;
                }

                try {
                    await db.insert(telegramChats).values({ chatId }).onConflictDoNothing();

                    await this.sendTelegramRequest("sendMessage", {
                        chat_id: chatId,
                        text: "Successfully subscribed to error reports!",
                    });
                } catch (error) {
                    this.logger.error("Error subscribing chat:", error);
                    await this.sendTelegramRequest("sendMessage", {
                        chat_id: chatId,
                        text: "Failed to subscribe. Please try again later.",
                    });
                }
                break;

            case "/unsubscribe":
                try {
                    await db.delete(telegramChats).where(eq(telegramChats.chatId, chatId));
                    await this.sendTelegramRequest("sendMessage", {
                        chat_id: chatId,
                        text: "Successfully unsubscribed from error reports!",
                    });
                } catch (error) {
                    this.logger.error("Error unsubscribing chat:", error);
                    await this.sendTelegramRequest("sendMessage", {
                        chat_id: chatId,
                        text: "Failed to unsubscribe. Please try again later.",
                    });
                }
                break;
        }
    }

    public async start() {
        if (!this.isEnabled) {
            this.logger.info("Telegram bot disabled");
            return;
        }
        try {
            const botInfo = await this.sendTelegramRequest("getMe");
            this.logger.info(`Telegram bot link: https://t.me/${botInfo.result.username}`);

            await this.setupCommands();

            let offset = 0;
            const poll = async () => {
                try {
                    const updates = await this.sendTelegramRequest("getUpdates", {
                        offset,
                        timeout: 30,
                    });

                    for (const update of updates.result) {
                        offset = update.update_id + 1;
                        await this.handleUpdate(update);
                    }
                } catch (error) {
                    this.logger.error("Error in polling updates:", error);
                    await sleep(5000);
                }
                poll();
            };

            poll();
            this.logger.info("Telegram bot started successfully");
        } catch (error) {
            this.logger.error("Failed to start Telegram bot:", error);
            throw error;
        }
    }

    public async broadcastMessage(text: string, meta?: { boardId?: string; msg?: AiChatMsg }) {
        try {
            const chats = await db.select().from(telegramChats);

            for (const chat of chats) {
                try {
                    await this.sendTelegramRequest("sendMessage", {
                        chat_id: chat.chatId,
                        text:
                            text +
                            (meta?.boardId ? `\n\nBoard: ${meta.boardId}` : "") +
                            (meta?.msg ? `\n\nMessage: ${meta.msg}` : ""),
                        parse_mode: "Markdown",
                    });
                } catch (error) {
                    this.logger.error(`Failed to send message to chat ${chat.chatId}:`, error);
                }
            }
        } catch (error) {
            this.logger.error("Error broadcasting message:", error);
        }
    }

    public async sendMessage(chatId: number, text: string, options: any = {}) {
        if (!this.isEnabled) {
            this.logger.debug(`Telegram disabled: skipping message to ${chatId}`);
            return;
        }
        try {
            await this.sendTelegramRequest("sendMessage", {
                chat_id: chatId,
                text: text,
                ...options,
            });
        } catch (error) {
            this.logger.error(`Failed to send message to chat ${chatId}:`, error);
        }
    }
}
