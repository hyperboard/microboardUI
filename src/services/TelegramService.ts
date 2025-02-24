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
    source: "development" | "staging" | "production";
}

export class TelegramService {
    private readonly isEnabled: boolean;
    private baseUrl: string;
    private logger: winston.Logger;
    private appToken: string;
    private source: "development" | "staging" | "production";
    private messageQueue: Array<{
        chatId: string;
        message: string;
        options: any;
    }> = [];
    private isProcessingQueue = false;
    private readonly RATE_LIMIT_DELAY = 1000; // 1 second between messages

    constructor(private readonly config: TelegramServiceConfig) {
        this.baseUrl = `https://api.telegram.org/bot${this.config.token}`;
        this.logger = config.logger;
        this.appToken = this.config.appToken;
        this.source = this.config.source;
        this.isEnabled = this.config.isEnabled ?? true;
        this.logger.info(`TelegramService initialized with source: ${this.source}`);
    }

    private async sendTelegramRequest(method: string, params: any = {}) {
        if (!this.isEnabled) {
            this.logger.debug(`Telegram disabled: skipping ${method} request`);
            return { ok: true, result: [] };
        }

        return this.retryWithBackoff(async () => {
            try {
                this.logger.silly(`Sending request to Telegram API: ${method}`, { params });
                const response = await fetch(`${this.baseUrl}/${method}`, {
                    method: params ? "POST" : "GET",
                    headers: params ? { "Content-Type": "application/json" } : undefined,
                    body: params ? JSON.stringify(params) : undefined,
                });

                if (!response.ok) {
                    throw new Error(`Telegram API error: ${response.status} ${response.statusText}`);
                }
                this.logger.silly(`Telegram API response: ${method}`, { status: response.status });

                return await response.json();
            } catch (error) {
                this.logger.error(`Telegram API request failed (${method}):`, error);
                throw error;
            }
        });
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

    private async isUserSubscribed(chatId: string): Promise<boolean> {
        const chat = await db.select().from(telegramChats).where(eq(telegramChats.chatId, chatId)).limit(1);
        return chat.length > 0;
    }

    private async handleUpdate(update: any) {
        this.logger.silly("Received update:", JSON.stringify(update));
        if (!update.message?.text || !update.message?.chat?.id) return;

        const chatId = update.message.chat.id.toString();
        const text = update.message.text;
        this.logger.info(`Processing command: ${text}`);
        const [command, ...args] = text.split(" ");

        if (command !== "/start" && command !== "/subscribe") {
            const isSubscribed = await this.isUserSubscribed(chatId);

            if (!isSubscribed) {
                await this.sendTelegramRequest("sendMessage", {
                    chat_id: chatId,
                    text: "🔒 This is a private developer log chat. You need to subscribe first using the command:\n/subscribe <app-token>",
                });
                return;
            }
        }

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
                    await db
                        .insert(telegramChats)
                        .values({
                            chatId,
                        })
                        .onConflictDoNothing();

                    await this.sendTelegramRequest("sendMessage", {
                        chat_id: chatId,
                        text: `Successfully subscribed to error reports! (Source: ${this.source})`,
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
                    this.logger.silly("Polling Telegram updates...");
                    const updates = await this.sendTelegramRequest("getUpdates", {
                        offset,
                        timeout: 30,
                    });

                    this.logger.silly(`Received ${updates.result?.length || 0} updates`);

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

    private async formatPipelineSteps(steps: Array<{ name: string; status: "success" | "error" | "pending" }>) {
        return steps
            .map((step) => {
                const icon = step.status === "success" ? "🗸" : step.status === "error" ? "✗" : "…";
                return `${icon} ${step.name}`;
            })
            .join("\n");
    }

    public async broadcastMessage(
        text: string,
        meta?: {
            boardId?: string;
            msg?: AiChatMsg;
            operationContext?: {
                boardId: string;
                itemId: string;
                requestType: "text" | "image" | "audio";
                startTime: number;
                model?: string;
                pipelineSteps?: Array<{ name: string; status: "success" | "error" | "pending" }>;
            };
            errorContext?: {
                boardId: string;
                chatId: string;
                timestamp: string;
                activeOperations: Array<{
                    itemId: string;
                    boardId: string;
                    requestType: string;
                    startTime: number;
                    model?: string;
                }>;
                activeStreams: string[];
            };
        }
    ) {
        this.logger.silly("Starting broadcast message process", {
            textLength: text.length,
            hasMeta: !!meta,
            source: this.source,
        });

        if (!this.isEnabled) {
            this.logger.info("Broadcast skipped - Telegram service is disabled");
            return;
        }

        try {
            this.logger.silly("Fetching telegram chats from database...");
            const chats = await db.select().from(telegramChats);
            this.logger.info(`Found ${chats.length} telegram chats to broadcast to`);

            if (chats.length === 0) {
                this.logger.warn("No telegram chats found to broadcast to");
                return;
            }

            for (const chat of chats) {
                this.logger.silly(`Processing broadcast for chat ${chat.chatId}`);

                try {
                    const operationInfo = meta?.operationContext
                        ? `\n\n⚙ Operation Details:
• Type: ${meta.operationContext.requestType}
• Model: ${meta.operationContext.model || "N/A"}
• Duration: ${Date.now() - meta.operationContext.startTime}ms${
                              meta.operationContext.pipelineSteps
                                  ? `\n\n⚡ Pipeline Status:\n${await this.formatPipelineSteps(
                                        meta.operationContext.pipelineSteps
                                    )}`
                                  : ""
                          }`
                        : "";

                    const errorInfo = meta?.errorContext
                        ? `\n\n⚠ Error Details:
• Board: ${meta.errorContext.boardId}
• Chat: ${meta.errorContext.chatId}
• Time: ${meta.errorContext.timestamp}
• Active Operations: ${meta.errorContext.activeOperations.length}
• Active Streams: ${meta.errorContext.activeStreams.length}`
                        : "";

                    const wsMessage = meta?.msg
                        ? `\n\nWebSocket Message:\n\`\`\`json\n${JSON.stringify(meta.msg, null, 2)}\n\`\`\``
                        : "";

                    const message = this.validateMessage(
                        [
                            `${text}`,
                            meta?.boardId ? `\n[#] Board: ${meta.boardId}` : "",
                            operationInfo,
                            errorInfo,
                            wsMessage,
                        ].join("")
                    );

                    this.messageQueue.push({
                        chatId: chat.chatId,
                        message,
                        options: {
                            parse_mode: "Markdown",
                        },
                    });

                    this.processMessageQueue();
                } catch (error) {
                    this.logger.error(`Failed to send broadcast to chat ${chat.chatId}:`, {
                        error:
                            error instanceof Error
                                ? {
                                      message: error.message,
                                      stack: error.stack,
                                  }
                                : error,
                        chatId: chat.chatId,
                    });

                    if (
                        error instanceof Error &&
                        (error.message.includes("chat not found") ||
                            error.message.includes("bot was blocked") ||
                            error.message.includes("deactivated"))
                    ) {
                        this.logger.warn(`Removing inactive chat ${chat.chatId} from database`);
                        await db.delete(telegramChats).where(eq(telegramChats.chatId, chat.chatId));
                    }
                }
            }
        } catch (error) {
            this.logger.error("Error in broadcast message process:", error);
        }
    }

    private async retryWithBackoff<T>(operation: () => Promise<T>, maxRetries: number = 3): Promise<T> {
        let lastError: Error;
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));
                this.logger.warn(`Retry ${i + 1}/${maxRetries} failed:`, {
                    error: lastError.message,
                    attempt: i + 1,
                });

                if (i < maxRetries - 1) {
                    const delay = Math.min(1000 * Math.pow(2, i), 10000);
                    await new Promise((resolve) => setTimeout(resolve, delay));
                }
            }
        }
        throw lastError!;
    }

    private validateMessage(message: string): string {
        const MAX_LENGTH = 4096; // Telegram's message length limit

        if (message.length > MAX_LENGTH) {
            this.logger.warn(
                `Message exceeds Telegram length limit, truncating from ${message.length} to ${MAX_LENGTH} chars`
            );
            return message.substring(0, MAX_LENGTH - 100) + "\n... [message truncated]";
        }

        return message;
    }

    private async processMessageQueue() {
        if (this.isProcessingQueue) return;
        this.isProcessingQueue = true;

        while (this.messageQueue.length > 0) {
            const msg = this.messageQueue.shift();
            if (!msg) continue;

            try {
                await this.sendTelegramRequest("sendMessage", {
                    chat_id: msg.chatId,
                    text: msg.message,
                    ...msg.options,
                });
                await new Promise((resolve) => setTimeout(resolve, this.RATE_LIMIT_DELAY));
            } catch (error) {
                this.logger.error(`Failed to process queued message:`, error);
            }
        }

        this.isProcessingQueue = false;
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
