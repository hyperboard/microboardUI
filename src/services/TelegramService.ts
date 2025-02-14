import winston from "winston";
import { db } from "drizzle/db";
import { telegramChats } from "drizzle/entities";
import { eq } from "drizzle-orm";
import { sleep } from "openai/core";
import { AiChatMsg } from "WebSocket/ai-chat";
import cron from "node-cron";
import {
    getFirstPaymentsToday,
    getNewBoardsToday,
    getNewUsersToday,
    getRenewalsToday,
    getTotalBoardEvents,
    getTotalBoards,
    getTotalPayingUsers,
    getTotalUsers,
} from "drizzle/functions/board/MetricsDashboard";

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
        this.logger.info("TelegramService initialized");
    }

    private async sendTelegramRequest(method: string, params: any = {}) {
        if (!this.isEnabled) {
            this.logger.debug(`Telegram disabled: skipping ${method} request`);
            return { ok: true, result: [] };
        }
        try {
            this.logger.debug(`Sending request to Telegram API: ${method}`, { params });
            const response = await fetch(`${this.baseUrl}/${method}`, {
                method: params ? "POST" : "GET",
                headers: params ? { "Content-Type": "application/json" } : undefined,
                body: params ? JSON.stringify(params) : undefined,
            });

            if (!response.ok) {
                throw new Error(`Telegram API error: ${response.status} ${response.statusText}`);
            }
            this.logger.debug(`Telegram API response: ${method}`, { status: response.status, data: response.body });

            return await response.json();
        } catch (error) {
            this.logger.error(`Telegram API request failed (${method}):`, error);
            throw error;
        }
    }

    private async getDashboardMetrics(): Promise<string> {
        const [
            totalBoards,
            newBoardsToday,
            totalUsers,
            newUsersToday,
            totalBoardEvents,
            firstPaymentsToday,
            renewalsToday,
            totalPayingUsers,
        ] = await Promise.all([
            getTotalBoards(),
            getNewBoardsToday(),
            getTotalUsers(),
            getNewUsersToday(),
            getTotalBoardEvents(),
            getFirstPaymentsToday(),
            getRenewalsToday(),
            getTotalPayingUsers(),
        ]);

        return `
            Всего досок: ${totalBoards}
            Новых досок сегодня: ${newBoardsToday}
            Всего пользователей: ${totalUsers}
            Новых пользователей сегодня: ${newUsersToday}
            Всего событий на досках: ${totalBoardEvents}
            Первых платежей сегодня: ${firstPaymentsToday}
            Продлений сегодня: ${renewalsToday}
            Всего платящих пользователей: ${totalPayingUsers}
        `;
    }

    private scheduleDailyMetrics() {
        cron.schedule("0 8,20 * * *", async () => {
            try {
                const metrics = await this.getDashboardMetrics();
                await this.broadcastMessage(`Ежедневные метрики дашборда:\n${metrics}`);
            } catch (error) {
                this.logger.error("Ошибка при отправке ежедневных метрик:", error);
            }
        });
    }

    private async setupCommands() {
        const commands = [
            { command: "start", description: "Start the bot" },
            { command: "subscribe", description: "Subscribe to error reports" },
            { command: "unsubscribe", description: "Unsubscribe from error reports" },
            { command: "metrics", description: "Get metrics dashboard" },
        ];

        try {
            await this.sendTelegramRequest("setMyCommands", { commands });
            this.logger.info("Bot commands set successfully");
        } catch (error) {
            this.logger.error("Failed to set bot commands:", error);
        }
    }

    private async handleUpdate(update: any) {
        this.logger.debug("Received update:", JSON.stringify(update));
        if (!update.message?.text || !update.message?.chat?.id) return;

        const chatId = update.message.chat.id.toString();
        const text = update.message.text;
        this.logger.info(`Processing command: ${text}`);
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
                this.logger.debug(`Subscribe attempt with token: ${token}`);
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
            case "/metrics":
                try {
                    const metrics = await this.getDashboardMetrics();
                    await this.sendTelegramRequest("sendMessage", {
                        chat_id: chatId,
                        text: `Dashboard Metrics:\n${metrics}`,
                    });
                } catch (error) {
                    this.logger.error("Error fetching metrics:", error);
                    await this.sendTelegramRequest("sendMessage", {
                        chat_id: chatId,
                        text: "Failed to fetch metrics. Please try again later.",
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
            this.logger.info("Starting Telegram bot...");
            const botInfo = await this.sendTelegramRequest("getMe");
            this.logger.info(`Telegram bot link: https://t.me/${botInfo.result.username}`);

            await this.setupCommands();

            let offset = 0;
            const poll = async () => {
                try {
                    this.logger.debug("Polling Telegram updates...");
                    const updates = await this.sendTelegramRequest("getUpdates", {
                        offset,
                        timeout: 30,
                    });

                    this.logger.debug(`Received ${updates.result?.length || 0} updates`);

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
            this.scheduleDailyMetrics();
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
