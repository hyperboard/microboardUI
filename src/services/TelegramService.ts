import winston from "winston";
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
    notifierUrl: string; // New config option for notifier service URL
}

export class TelegramService {
    private readonly isEnabled: boolean;
    private logger: winston.Logger;
    private notifierUrl: string;
    private metricsJob?: cron.ScheduledTask;

    constructor(private readonly config: TelegramServiceConfig) {
        this.logger = config.logger;
        this.isEnabled = this.config.isEnabled ?? true;
        this.notifierUrl = config.notifierUrl.replace(/\/$/, "");
        this.logger.info(`TelegramService initialized with source: ${this.config.source}`);
    }

    private async sendNotifierRequest(endpoint: string, method: "GET" | "POST" | "DELETE", body?: any) {
        try {
            const response = await fetch(`${this.notifierUrl}${endpoint}`, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: body ? JSON.stringify(body) : undefined,
            });

            if (!response.ok) {
                throw new Error(`Notifier service error: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            this.logger.error("Failed to send request to notifier service:", error);
            throw error;
        }
    }

    private async getDashboardMetrics() {
        try {
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

            await this.sendNotifierRequest("/metrics", "POST", {
                totalBoards,
                newBoardsToday,
                totalUsers,
                newUsersToday,
                totalBoardEvents,
                firstPaymentsToday,
                renewalsToday,
                totalPayingUsers,
            });

            this.logger.debug("Dashboard metrics sent to notifier service");
        } catch (error) {
            this.logger.error("Failed to send dashboard metrics:", error);
            throw error;
        }
    }

    private scheduleDailyMetrics() {
        this.metricsJob = cron.schedule("0 8,20 * * *", async () => {
            try {
                await this.getDashboardMetrics();
            } catch (error) {
                this.logger.error("Error in scheduled metrics job:", error);
            }
        });
    }

    public async start() {
        if (!this.isEnabled) {
            this.logger.info("Telegram service disabled");
            return;
        }

        this.scheduleDailyMetrics();
        this.logger.info("Telegram service started");
    }

    public async stop() {
        if (this.metricsJob) {
            this.metricsJob.stop();
        }
        this.logger.info("Telegram service stopped");
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
        if (!this.isEnabled) {
            this.logger.info("Broadcast skipped - Telegram service is disabled");
            return;
        }

        try {
            await this.sendNotifierRequest("/notify", "POST", { text, meta });
            this.logger.debug("Message broadcast sent to notifier service");
        } catch (error) {
            this.logger.error("Failed to broadcast message:", error);
            throw error;
        }
    }

    public async sendMessage(chatId: number, text: string, options: any = {}) {
        if (!this.isEnabled) {
            this.logger.debug(`Telegram disabled: skipping message to ${chatId}`);
            return;
        }

        try {
            await this.sendNotifierRequest("/notify", "POST", {
                text,
                meta: {
                    directMessage: {
                        chatId: chatId.toString(),
                        options,
                    },
                },
            });
        } catch (error) {
            this.logger.error(`Failed to send message to chat ${chatId}:`, error);
            throw error;
        }
    }
}
