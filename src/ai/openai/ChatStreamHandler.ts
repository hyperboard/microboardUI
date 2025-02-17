import { and, asc, desc, eq, inArray, ne } from "drizzle-orm";
import { db } from "drizzle/db";
import { boardOwner, boards } from "drizzle/entities";
import { Chat, chat, Message, message, MessageRole, MessageStatus } from "drizzle/entities/ai";
import { modelLimits } from "drizzle/entities/plans";
import { getEncoding } from "js-tiktoken";
import {
    ChatCompletionChunk,
    ChatCompletionContentPart,
    ChatCompletionMessageParam,
    CompletionUsage,
} from "openai/resources";
import { Stream } from "openai/streaming";
import { Redis } from "Redis";
import {
    getAdjustReadingLevelPrompt,
    getAdjustTextLengthPrompt,
    getChatQueryGeneratorPrompt,
    getChatSystemPrompt,
    getChatUserPrompt,
    getEmojiPrompt,
} from "Routes/V1/AI/prompts/chat";
import { getAudioModelLimits, getCurrentModelLimits, getCurrentUserPlan } from "Routes/V1/Billing/utils";
import { getJson } from "serpapi";
import { TelegramService } from "services/TelegramService";
import {
    AiChatEventType,
    AiChatMsg,
    ChatChunk,
    GenerateAudioEvent,
    GenerateAudioResponse,
    GenerateImageEvent,
    GenerateImageResponse,
    GetMessageList,
    MessageList,
    StopGeneration,
    UserRequest,
} from "WebSocket/ai-chat";
import { generateAudio, GenerateAudioOptions } from "WebSocket/audio-generator";
import { GenerateImageOptions, ImageGenerator } from "WebSocket/image-generator";
import winston from "winston";
import WebSocket from "ws";
import { OpenAI } from ".";

type PipelineStep = {
    name: string;
    status: "success" | "error" | "pending";
};

interface AiChatLogContext {
    boardId: string;
    itemId: string;
    requestType: "text" | "image" | "audio";
    startTime: number;
    model?: string;
    pipelineSteps?: PipelineStep[];
}

class UsageLimitChecker {
    constructor(private logger: winston.Logger) {}

    public async checkUserLimits(
        userId: number,
        modelId: string
    ): Promise<{
        canProceed: boolean;
        error?: string;
    }> {
        const userPlan = await getCurrentUserPlan(userId);
        const mLimits = await db
            .select()
            .from(modelLimits)
            .where(and(eq(modelLimits.modelId, modelId), eq(modelLimits.planId, userPlan.planId)))
            .limit(1);

        const planLimit = mLimits[0];

        if (!planLimit?.isEnabled) {
            return { canProceed: false, error: "Model not available in your plan" };
        }

        if (!planLimit.dailyRequestLimit && !planLimit.weeklyRequestLimit) {
            return { canProceed: true };
        }

        const modelUsage = await getCurrentModelLimits(userId);
        const currentModelUsage = modelUsage.find((m) => m.modelName === modelId);

        if (!currentModelUsage) {
            return { canProceed: false, error: "Model not found" };
        }

        this.logger.debug(
            `${modelId} - dailyUsage: ${currentModelUsage.dailyUsage}, weeklyUsage: ${currentModelUsage.weeklyUsage}`
        );

        if (
            (planLimit.dailyRequestLimit && currentModelUsage.dailyUsage >= planLimit.dailyRequestLimit) ||
            (planLimit.weeklyRequestLimit && currentModelUsage.weeklyUsage >= planLimit.weeklyRequestLimit)
        ) {
            return { canProceed: false, error: "Request limit exceeded" };
        }

        return { canProceed: true };
    }

    public async checkImageGenerationLimits(userId: number): Promise<{
        canProceed: boolean;
        error?: string;
    }> {
        const modelUsage = await getCurrentModelLimits(userId);
        const imageGenUsage = modelUsage.find((m) => m.modelName === "image-generation");

        if (!imageGenUsage?.isEnabled) {
            return { canProceed: false, error: "Image generation not available in your plan" };
        }

        if (!imageGenUsage.dailyLimit) {
            return { canProceed: true };
        }

        if (imageGenUsage.dailyLimit && imageGenUsage.dailyUsage >= imageGenUsage.dailyLimit) {
            return { canProceed: false, error: "Image generation limit exceeded" };
        }

        return { canProceed: true };
    }

    public async checkAudioGenerationLimits(
        userId: number,
        text: string
    ): Promise<{
        canProceed: boolean;
        error?: string;
    }> {
        const modelUsage = await getAudioModelLimits(userId);

        if (!modelUsage.limit) {
            return { canProceed: false, error: "Audio generation not available in your plan" };
        }

        if (modelUsage.limit <= modelUsage.symbolsUsed) {
            return { canProceed: false, error: "Audio generation limit exceeded" };
        }

        return { canProceed: true };
    }
}

class SerpApi {
    private apiKey = "29d96f8ff55e566b32fdc0ab65da79fc4ca76e44680c50d4a23ead5dfff80faa";

    async getJson(query: string): Promise<{
        answer_box: any;
        organic: any;
    }> {
        const result: {
            answer_box: any;
            organic: any;
        } = {
            answer_box: null,
            organic: null,
        };
        const response = await getJson({
            api_key: this.apiKey,
            engine: "google",
            q: query,
            location: "Moscow",
        });

        console.log(response);

        result["answer_box"] = response?.answer_box?.snippet;

        result["organic"] = response?.organic_results?.map(
            ({ title, link, snippet }: { title: string; link: string; snippet: string }) => ({
                title,
                link,
                snippet,
            })
        );

        return result;
    }
}

export class ChatStreamHandler {
    private openai: OpenAI;
    private serpapi = new SerpApi();
    private encoder = getEncoding("cl100k_base");
    private usageLimitChecker: UsageLimitChecker;
    private redis: Redis;
    private telegramService: TelegramService;
    private logger: winston.Logger;

    boardClients = new Map<string, WebSocket.WebSocket[]>();

    private pendingStreams = new Map<
        string,
        Promise<
            | (Stream<ChatCompletionChunk> & {
                  _request_id?: string | null;
              })
            | null
        >
    >();

    private activeStreams = new Map<
        string,
        {
            stream: Stream<ChatCompletionChunk> & {
                _request_id?: string | null;
            };
            controller: AbortController;
        }
    >();

    // Track ongoing AI operations
    private activeOperations = new Map<string, AiChatLogContext>();

    constructor(openai: OpenAI, logger: winston.Logger, redis: Redis, telegramService: TelegramService) {
        this.openai = openai;
        this.logger = logger;
        this.usageLimitChecker = new UsageLimitChecker(logger);
        this.redis = redis;
        this.telegramService = telegramService;
    }

    private logOperationStart(context: AiChatLogContext) {
        this.activeOperations.set(context.itemId, {
            ...context,
            startTime: Date.now(),
        });

        this.logger.info(`AI Operation Started`, {
            operation: "start",
            ...context,
            timestamp: new Date().toISOString(),
        });
    }

    private logOperationEnd(itemId: string, status: "success" | "error", error?: string) {
        const context = this.activeOperations.get(itemId);
        if (!context) return;

        const duration = Date.now() - context.startTime;

        this.logger.info(`AI Operation ${status === "success" ? "Completed" : "Failed"}`, {
            operation: "end",
            ...context,
            status,
            duration,
            error,
            timestamp: new Date().toISOString(),
        });

        this.activeOperations.delete(itemId);
    }

    private async reportToTelegramBot(
        text: string,
        meta?: {
            boardId?: string;
            msg?: AiChatMsg<AiChatEventType>;
            operationContext?: AiChatLogContext;
            errorContext?: {
                boardId: string;
                chatId: string;
                timestamp: string;
                activeOperations: Array<{ itemId: string } & AiChatLogContext>;
                activeStreams: string[];
            };
        }
    ) {
        const boardId = meta?.boardId || meta?.msg?.boardId || "unknown";
        await this.telegramService.broadcastMessage(text, {
            boardId,
            msg: meta?.msg,
            operationContext: meta?.operationContext,
            errorContext: meta?.errorContext,
        });
    }

    private countTokens(text: string): number {
        return this.encoder.encode(text).length;
    }

    async fetchQuery(idea: string): Promise<string | null> {
        const analyze = await this.openai.generateChatCompletion([
            {
                role: MessageRole.SYSTEM,
                content: getChatQueryGeneratorPrompt(),
            },
            {
                role: MessageRole.USER,
                content: idea,
            },
        ]);

        if (!analyze) {
            return null;
        }

        return analyze?.includes("null") ? null : analyze;
    }

    async stopConversation(options: {
        msg: AiChatMsg<StopGeneration>;
        boardId: string;
        ws: WebSocket;
        logger: winston.Logger;
        itemId: string;
    }) {
        const { boardId, ws, logger, msg, itemId } = options;
        const foundedChat = await this.ensureChatExists(msg, logger);

        try {
            logger.debug(`Attempting to stop conversation for item ${itemId}`);

            const itemStreamEntry = this.activeStreams.get(itemId);
            logger.debug("ABORT STREAM:", { entry: itemStreamEntry });

            if (itemStreamEntry) {
                logger.debug(`Aborting stream for item ${itemId}`);
                itemStreamEntry.controller.abort();

                this.activeStreams.delete(itemId);

                logger.debug(`Stream for item ${itemId} successfully aborted`);
            } else {
                logger.debug(`No active stream found for item ${itemId}`);

                const pendingItemStreamEntry = this.pendingStreams.get(itemId);
                if (!pendingItemStreamEntry) {
                    logger.debug(`No active or pending stream found for item ${itemId}`);
                    return;
                }
                this.pendingStreams.delete(itemId);
            }

            const foundedChat = await this.ensureChatExists(msg, logger);

            await this.saveMessage({
                chat: foundedChat,
                role: MessageRole.SYSTEM,
                content: "Conversation manually stopped by user",
                logger,
                model: "unsupported",
            });
            const stopChunk: AiChatMsg<ChatChunk> = {
                type: "AiChat",
                boardId: boardId,
                event: {
                    method: "ChatChunk",
                    type: "done",
                    chatId: foundedChat.id,
                    itemId,
                },
            };

            ws.send(JSON.stringify(stopChunk));
        } catch (error) {
            logger.error(`Error stopping conversation for item ${itemId}:`, error);

            this.sendErrorResponse(
                foundedChat,
                ws,
                error instanceof Error ? error.message : "Failed to stop conversation",
                msg.boardId,
                msg.event.itemId,
                msg
            );
        }
    }

    public async handleGetMessageList({
        msg,
        logger,
        boardClients,
        ws,
    }: {
        msg: AiChatMsg<GetMessageList>;
        logger: winston.Logger;
        boardClients: Map<string, WebSocket.WebSocket[]>;
        ws: WebSocket;
    }) {
        const verifiedChat = await this.ensureChatExists(msg, logger);
        this.boardClients = boardClients;

        console.log("verifiedChat: ", verifiedChat);
        const messages = await db
            .select()
            .from(message)
            .where(and(eq(message.chatId, verifiedChat.id), eq(message.archived, false), ne(message.role, "system")))
            .orderBy(message.createdAt);

        // console.log("messages: ", messages);
        const msgToSend: AiChatMsg<MessageList> = {
            type: "AiChat",
            boardId: msg.boardId,
            event: {
                method: "MessageList",
                messages,
            },
        };

        ws.send(JSON.stringify(msgToSend));
    }

    public async handleGenerateImage(
        msg: AiChatMsg<GenerateImageEvent>,
        boardClients: Map<string, WebSocket.WebSocket[]>,
        imageGenerator: ImageGenerator,
        ws: WebSocket,
        logger: winston.Logger
    ) {
        const pipelineSteps: PipelineStep[] = [
            { name: "Initialize Image Generation", status: "pending" as const },
            { name: "Check Usage Limits", status: "pending" as const },
            { name: "Create or Get Chat", status: "pending" as const },
            { name: "Validate Image Options", status: "pending" as const },
            { name: "Send Generation Start Event", status: "pending" as const },
            { name: "Generate Image", status: "pending" as const },
            { name: "Process Image Result", status: "pending" as const },
            { name: "Save Image Message", status: "pending" as const },
            { name: "Send Final Response", status: "pending" as const },
        ];

        const context: AiChatLogContext = {
            boardId: msg.boardId,
            itemId: msg.event.itemId,
            requestType: "image",
            startTime: Date.now(),
            model: msg.event.options.model,
            pipelineSteps,
        };

        try {
            this.logOperationStart(context);
            pipelineSteps[0].status = "success";

            const boardOwnerId = await this.getBoardOwner(msg.boardId);
            const imageLimits = await this.usageLimitChecker.checkImageGenerationLimits(boardOwnerId);
            if (!imageLimits.canProceed) {
                pipelineSteps[1].status = "error";
                const errorMsg = `Image generation limits exceeded for board ${msg.boardId}`;
                this.sendErrorResponse(
                    null,
                    ws,
                    imageLimits.error || "LimitExceeded",
                    msg.boardId,
                    msg.event.itemId,
                    msg,
                    {
                        operationContext: context,
                        wsMessage: msg,
                    }
                );
                this.logOperationEnd(msg.event.itemId, "error", errorMsg);
                return;
            }
            pipelineSteps[1].status = "success";

            const chat = await this.ensureChatExists(msg, logger);
            pipelineSteps[2].status = "success";

            const baseOptions = {
                prompt: msg.event.prompt,
                itemId: msg.event.itemId,
            };

            let options: GenerateImageOptions;
            switch (msg.event.options.model) {
                case "midjourney": {
                    options = {
                        ...baseOptions,
                        model: "midjourney",
                    };
                    break;
                }
                case "dall-e-2": {
                    options = {
                        ...baseOptions,
                        model: "dall-e-2",
                        size: msg.event.options?.size,
                    };
                    break;
                }
                case "dall-e-3": {
                    options = {
                        ...baseOptions,
                        model: "dall-e-3",
                        size: msg.event.options?.size,
                    };
                    break;
                }
                case "flux-schnell":
                case "flux-pro": {
                    options = {
                        ...baseOptions,
                        model: msg.event.options.model,
                        aspectRatio: msg.event.options?.aspect_ratio,
                    };
                    break;
                }
                default: {
                    throw new Error(`Unsupported image model`);
                }
            }
            pipelineSteps[3].status = "success";

            const generatingMsg: AiChatMsg<GenerateImageResponse> = {
                type: "AiChat",
                boardId: msg.boardId,
                event: {
                    method: "GenerateImage",
                    status: "generating",
                    base64: null,
                    imageUrl: null,
                    itemId: msg.event.itemId,
                },
            };
            ws.send(JSON.stringify(generatingMsg));
            pipelineSteps[4].status = "success";

            const result = await imageGenerator.generateImage(options);
            pipelineSteps[5].status = "success";

            if (!result.base64 && !result.imageUrl) {
                throw new Error("Image generation failed - no result returned");
            }
            pipelineSteps[6].status = "success";

            await this.saveMessage({
                chat,
                role: MessageRole.ASSISTANT,
                content: result.base64 || "",
                logger,
                model: "image-generation",
            });
            pipelineSteps[7].status = "success";

            const msgToSend: AiChatMsg<GenerateImageResponse> = {
                type: "AiChat",
                boardId: msg.boardId,
                event: {
                    method: "GenerateImage",
                    status: "completed",
                    itemId: msg.event.itemId,
                    base64: result.base64,
                    imageUrl: result.imageUrl,
                },
            };
            ws.send(JSON.stringify(msgToSend));
            pipelineSteps[8].status = "success";

            this.logOperationEnd(msg.event.itemId, "success");
        } catch (error) {
            const lastSuccessIndex = pipelineSteps.findIndex((step) => step.status === "pending") - 1;
            if (lastSuccessIndex >= 0 && lastSuccessIndex + 1 < pipelineSteps.length) {
                pipelineSteps[lastSuccessIndex + 1].status = "error";
            }

            const errorMsg = `Error handling image generation for board ${msg.boardId}: ${error}`;
            console.error(errorMsg);
            this.logOperationEnd(msg.event.itemId, "error", errorMsg);

            this.sendErrorResponse(
                null,
                ws,
                error instanceof Error ? error.message : "Unknown error",
                msg.boardId,
                msg.event.itemId,
                msg,
                {
                    operationContext: context,
                    wsMessage: msg,
                }
            );
        }
    }

    public async handleGenerateAudio(
        msg: AiChatMsg<GenerateAudioEvent>,
        boardClients: Map<string, WebSocket.WebSocket[]>,
        ws: WebSocket,
        logger: winston.Logger
    ) {
        this.boardClients = boardClients; // ?

        const boardOwnerId = await this.getBoardOwner(msg.boardId); // todo check requested user instead of board owner
        const audioLimits = await this.usageLimitChecker.checkAudioGenerationLimits(boardOwnerId, msg.event.text);

        if (!audioLimits.canProceed) {
            ws.send(
                JSON.stringify({
                    type: "AiChat",
                    boardId: msg.boardId,
                    event: {
                        method: "GenerateAudio",
                        status: "error",
                        error: audioLimits.error,
                        message: "LimitExceeded",
                        base64: null,
                        audioUrl: null,
                    },
                })
            );
            return;
        }

        const generatingMsg: AiChatMsg<GenerateAudioResponse> = {
            type: "AiChat",
            boardId: msg.boardId,
            event: {
                method: "GenerateAudio",
                status: "generating",
                base64: null,
                audioUrl: null,
            },
        };
        ws.send(JSON.stringify(generatingMsg));

        try {
            const options: GenerateAudioOptions = {
                text: msg.event.text,
                model: "tts-1-hd",
                openaiToken: process.env.OPENAI_API_KEY!,
            };
            const result = await generateAudio(options);

            const chat = await this.ensureChatExists(msg, logger);

            await this.saveAudioMessage({
                chat,
                role: MessageRole.ASSISTANT,
                symbolsUsed: msg.event.text.length,
                logger,
                model: options.model,
            });

            const msgToSend: AiChatMsg<GenerateAudioResponse> = {
                type: "AiChat",
                boardId: msg.boardId,
                event: {
                    method: "GenerateAudio",
                    status: "completed",
                    base64: result.base64,
                    audioUrl: result.audioUrl,
                },
            };
            ws.send(JSON.stringify(msgToSend));
        } catch (error) {
            const errorResponse: AiChatMsg<GenerateAudioResponse> = {
                type: "AiChat",
                boardId: msg.boardId,
                event: {
                    method: "GenerateAudio",
                    status: "error",
                    base64: null,
                    audioUrl: null,
                    message: `Audio generation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
                },
            };
            ws.send(JSON.stringify(errorResponse));
        }
    }

    private async handleThreading(chat: Chat, msg: AiChatMsg<UserRequest>): Promise<number | undefined> {
        // Starting new thread from specific message
        if (msg.event.createThreadFrom) {
            const [sourceMessage] = await db
                .select()
                .from(message)
                .where(
                    and(
                        eq(message.itemId, msg.event.createThreadFrom),
                        eq(message.role, MessageRole.USER),
                        eq(message.archived, false)
                    )
                )
                .limit(1);

            return sourceMessage?.id;
        }

        // Continue existing thread
        const [lastMessage] = await db
            .select()
            .from(message)
            .where(and(eq(message.chatId, chat.id), eq(message.role, MessageRole.USER), eq(message.archived, false)))
            .orderBy(desc(message.createdAt))
            .limit(1);

        return lastMessage?.id;
    }

    private async getBoardOwner(boardUUID: string): Promise<number> {
        const [board] = await db.select().from(boards).where(eq(boards.uniqId, boardUUID)).limit(1);
        if (!board) return 0;
        const [owner] = await db.select().from(boardOwner).where(eq(boardOwner.boardId, board.id));
        if (owner) {
            return owner.ownerId;
        }
        return 0;
    }

    private async getContextMessages(msg: AiChatMsg<UserRequest>, logger: winston.Logger): Promise<Message[]> {
        if (!msg.event.contextRequest?.messageId) {
            return [];
        }

        const range = msg.event.contextRequest.range || 5;
        const messages: Message[] = [];
        let currentItemId: string | null = msg.event.contextRequest.messageId;
        let count = 0;

        while (currentItemId && count < range) {
            const [userMsg] = await db
                .select()
                .from(message)
                .where(and(eq(message.itemId, currentItemId), eq(message.archived, false)))
                .limit(1);

            if (!userMsg) break;

            const [assistantMsg] = await db
                .select()
                .from(message)
                .where(
                    and(
                        eq(message.generatedFrom, userMsg.id),
                        eq(message.role, "assistant"),
                        eq(message.archived, false)
                    )
                )
                .limit(1);

            messages.unshift(userMsg);
            if (assistantMsg) {
                messages.unshift(assistantMsg);
            }

            if (userMsg.previousMessageId) {
                const [previousMsg] = await db
                    .select()
                    .from(message)
                    .where(eq(message.id, userMsg.previousMessageId))
                    .limit(1);

                currentItemId = previousMsg?.itemId || null;
            } else {
                currentItemId = null;
            }
            count++;
        }

        return messages;
    }

    public async handleUserRequest(options: {
        msg: AiChatMsg<UserRequest>;
        ws: WebSocket;
        logger: winston.Logger;
        boardClients: Map<string, WebSocket.WebSocket[]>;
    }) {
        const { msg, ws, logger, boardClients } = options;
        const controller = new AbortController();
        const pipelineSteps: PipelineStep[] = [
            { name: "Initialize Operation", status: "pending" as const },
            { name: "Check Usage Limits", status: "pending" as const },
            { name: "Create or Get Chat", status: "pending" as const },
            { name: "Setup System Prompt", status: "pending" as const },
            { name: "Process Context Messages", status: "pending" as const },
            { name: "Build User Prompt", status: "pending" as const },
            { name: "Save User Message", status: "pending" as const },
            { name: "Initialize Stream", status: "pending" as const },
            { name: "Generate Response", status: "pending" as const },
            { name: "Process Stream Chunks", status: "pending" as const },
            { name: "Save Assistant Message", status: "pending" as const },
            { name: "Finalize Response", status: "pending" as const },
        ];

        const context: AiChatLogContext = {
            boardId: msg.boardId,
            itemId: msg.event.itemId,
            requestType: "text",
            startTime: Date.now(),
            model: msg.event.model,
            pipelineSteps,
        };

        try {
            this.logOperationStart(context);
            pipelineSteps[0].status = "success";

            const boardOwnerId = await this.getBoardOwner(msg.boardId);
            const usageCheck = await this.usageLimitChecker.checkUserLimits(
                boardOwnerId,
                msg.event.model || "gpt-4o-mini"
            );
            if (!usageCheck.canProceed) {
                pipelineSteps[1].status = "error";
                this.sendErrorResponse(
                    null,
                    ws,
                    usageCheck.error || "LimitExceeded",
                    msg.boardId,
                    msg.event.itemId,
                    msg,
                    {
                        operationContext: context,
                        wsMessage: msg,
                    }
                );
                this.logOperationEnd(msg.event.itemId, "error", usageCheck.error);
                return;
            }
            pipelineSteps[1].status = "success";

            const chat = await this.ensureChatExists(msg, logger);
            pipelineSteps[2].status = "success";

            const contextMessages: ChatCompletionMessageParam[] = [];

            switch (msg.event?.action?.action) {
                case "adjust_text_length":
                    contextMessages.push({
                        role: MessageRole.SYSTEM,
                        content: getAdjustTextLengthPrompt(),
                    });
                    await this.saveMessage({
                        chat,
                        role: MessageRole.SYSTEM,
                        content: getAdjustTextLengthPrompt(),
                        logger,
                        model: msg.event.model || "gpt-4o-mini",
                    });
                    break;
                case "adjust_reading_level":
                    contextMessages.push({
                        role: MessageRole.SYSTEM,
                        content: getAdjustReadingLevelPrompt(),
                    });
                    await this.saveMessage({
                        chat,
                        role: MessageRole.SYSTEM,
                        content: getAdjustReadingLevelPrompt(),
                        logger,
                        model: msg.event.model || "gpt-4o-mini",
                    });
                    break;
                case "adjust_emojis":
                    contextMessages.push({
                        role: MessageRole.SYSTEM,
                        content: getEmojiPrompt(),
                    });
                    await this.saveMessage({
                        chat,
                        role: MessageRole.SYSTEM,
                        content: getEmojiPrompt(),
                        logger,
                        model: msg.event.model || "gpt-4o-mini",
                    });
                    break;
                default:
                    contextMessages.push({
                        role: MessageRole.SYSTEM,
                        content: getChatSystemPrompt(),
                    });
                    await this.saveMessage({
                        chat,
                        role: MessageRole.SYSTEM,
                        content: getChatSystemPrompt(),
                        logger,
                        model: msg.event.model || "gpt-4o-mini",
                    });
                    break;
            }
            pipelineSteps[3].status = "success";

            const simpleContextStrings = await this.getContextStrings(msg.event.context, logger);
            const messagesInContext = await this.getContextMessages(msg, logger);
            pipelineSteps[4].status = "success";

            const contextStrings = messagesInContext.map((m) => JSON.stringify({ content: m.content, role: m.role }));
            const boardContextStrings = msg.event.boardContext || [];
            let searchResult = "";
            // Keep the commented search code for future use
            // const searchQuery = await this.fetchQuery(msg.event.idea);
            // console.log("Search query: ", searchQuery);
            // if (searchQuery) {
            //     try {
            //         const googleResponse = await this.serpapi.getJson(searchQuery);
            //         console.log("Google response: ", googleResponse);
            //         const organic = googleResponse.organic;
            //
            //         if (organic) {
            //             console.log("Organic: ", organic);
            //             searchResult = `Internet search for user's query: ${JSON.stringify(organic)}`;
            //         }
            //     } catch (e) {
            //         console.error(`Error while fetching google response for boardId: ${msg.boardId}`, e);
            //     }
            // }
            // logger.debug("search result: ", searchResult);

            let userPrompt = getChatUserPrompt({
                idea: msg.event.idea,
                context:
                    contextStrings.length > 0
                        ? contextStrings.reverse().join(", ")
                        : simpleContextStrings.length > 0
                        ? simpleContextStrings.reverse().join(", ")
                        : "",
                boardContext: boardContextStrings.length > 0 ? boardContextStrings.join(", ") : "",
                searchResults: searchResult,
                level: msg.event?.action?.level,
            });
            pipelineSteps[5].status = "success";

            const inputArray: ChatCompletionContentPart[] = [
                {
                    type: "text",
                    text: userPrompt,
                },
            ];

            if (msg.event.images && msg.event.images.length > 0) {
                for (const imageUrl of msg.event.images) {
                    inputArray.push({
                        type: "image_url",
                        image_url: { url: imageUrl, detail: "auto" },
                    });
                }
            }

            logger.debug("Input array: ", inputArray);

            contextMessages.push({
                role: MessageRole.USER,
                content: inputArray,
            });

            const encoder = getEncoding("cl100k_base");
            const tokens = encoder.encode(`${getChatSystemPrompt()}${userPrompt}`);

            const previousMessageId = await this.handleThreading(chat, msg);
            console.log("Handle previous: ", previousMessageId);
            const userMessage = await this.saveMessage({
                chat,
                role: MessageRole.USER,
                content: msg.event.idea,
                logger,
                tokensUsed: tokens.length,
                itemId: msg.event.requestItemId,
                previousMessageId,
                model: msg.event.model || "gpt-4o-mini",
            });
            pipelineSteps[6].status = "success";

            logger.debug("Generating chat completion stream...");
            logger.debug("Context messages: ", JSON.stringify(contextMessages));

            let streamPromise: Promise<
                | (Stream<ChatCompletionChunk> & {
                      _request_id?: string | null | undefined;
                  })
                | null
            >;

            if (msg.event.model?.startsWith("deepseek-")) {
                streamPromise = this.openai.generateStreamChatCompletion(contextMessages, {
                    model: msg.event.model || "gpt-4o-mini",
                    signal: controller.signal,
                    customModel: msg.event.model as "deepseek-chat" | "deepseek-reasoner",
                });
            } else {
                streamPromise = this.openai.generateStreamChatCompletion(contextMessages, {
                    model: msg.event.model || "gpt-4o-mini",
                    signal: controller.signal,
                });
            }

            if (streamPromise) {
                this.pendingStreams.set(msg.event.itemId, streamPromise);
            }

            const stream = await streamPromise;

            if (!this.pendingStreams.get(msg.event.itemId)) {
                if (stream) {
                    controller.abort();
                }
                return;
            }

            this.pendingStreams.delete(msg.event.itemId);

            if (!stream) {
                console.error("Failed to create stream");
                this.sendErrorResponse(chat, ws, "Failed to create stream", msg.boardId, msg.event.itemId, msg);
                return;
            }

            this.activeStreams.set(msg.event.itemId, {
                stream,
                controller,
            });
            pipelineSteps[7].status = "success";
            logger.debug(`Stream created for item: ${msg.event.itemId} `, {
                controller: this.activeStreams.get(msg.event.itemId)?.controller,
                size: this.activeStreams.size,
            });

            logger.debug("Handling stream chunks...");
            ws.send("stream_created");
            this.handleStreamChunks({
                stream,
                ws,
                chat,
                logger,
                boardId: msg.boardId,
                controller,
                userMessage,
                itemId: msg.event.itemId,
                msg,
                context,
            });

            pipelineSteps[8].status = "success";
            this.logOperationEnd(msg.event.itemId, "success");
        } catch (error) {
            const lastSuccessIndex = pipelineSteps.findIndex((step) => step.status === "pending") - 1;
            if (lastSuccessIndex >= 0 && lastSuccessIndex + 1 < pipelineSteps.length) {
                pipelineSteps[lastSuccessIndex + 1].status = "error";
            }

            const errorMsg = `Error handling user request for board ${msg.boardId}: ${error}`;
            this.logOperationEnd(msg.event.itemId, "error", errorMsg);

            this.sendErrorResponse(
                null,
                ws,
                error instanceof Error ? error.message : "Unknown error",
                msg.boardId,
                msg.event.itemId,
                msg,
                {
                    operationContext: context,
                    wsMessage: msg,
                }
            );
        }
    }

    private async getMessageThread(messageId: number): Promise<Message[]> {
        const result: Message[] = [];
        let currentId = messageId;

        while (currentId) {
            const [msg] = await db
                .select()
                .from(message)
                .where(and(eq(message.id, currentId), eq(message.archived, false)))
                .limit(1);

            if (!msg) break;
            result.unshift(msg);
            currentId = msg.previousMessageId || 0;
        }

        return result;
    }

    private async getThreadContext(messages: Message[]): Promise<Message[]> {
        const context: Message[] = [];
        const seen = new Set<number>();

        for (const msg of messages) {
            if (seen.has(msg.id)) continue;

            const thread = await this.getMessageThread(msg.id);
            thread.forEach((m) => {
                if (!seen.has(m.id)) {
                    context.push(m);
                    seen.add(m.id);
                }
            });
        }

        return context.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    }

    private async getContextStrings(contextIds: string[], logger: winston.Logger): Promise<string[]> {
        const messages = await db
            .select()
            .from(message)
            .where(and(inArray(message.itemId, contextIds), eq(message.archived, false)))
            .orderBy(asc(message.id));

        const threadContext = await this.getThreadContext(messages);
        return threadContext.map((item) => JSON.stringify({ content: item.content, role: item.role }));
    }

    private async getThreadMessages(messages: Message[]): Promise<Message[]> {
        const threadMessages: Message[] = [];
        for (const msg of messages) {
            if (msg.previousMessageId) {
                const prevMessage = await this.getPreviousMessageChain(msg.previousMessageId);
                threadMessages.push(...prevMessage);
            }
        }
        return threadMessages;
    }

    private async getPreviousMessageChain(messageId: number): Promise<Message[]> {
        const messages: Message[] = [];
        let currentId: number | null = messageId;

        while (currentId) {
            const [m] = await db
                .select()
                .from(message)
                .where(and(eq(message.id, currentId), eq(message.archived, false)))
                .limit(1);

            if (!message) break;

            messages.push(m);
            currentId = m.previousMessageId || 0;
        }

        return messages.reverse();
    }

    private async ensureChatExists(msg: AiChatMsg, logger: winston.Logger): Promise<Chat> {
        logger.debug("Checking chat existence...", { boardId: msg.boardId });

        try {
            let [boardChat] = await db.select().from(chat).where(eq(chat.boardId, msg.boardId)).limit(1);

            if (!boardChat) {
                logger.info("Chat not found, creating new one", { boardId: msg.boardId });
                const [newChat] = await db.insert(chat).values({ boardId: msg.boardId }).returning();
                if (!newChat) {
                    throw new Error("Failed to create new chat");
                }
                return newChat;
            }

            logger.debug("Existing chat found", {
                boardId: msg.boardId,
                chatId: boardChat.id,
            });
            return boardChat;
        } catch (error) {
            const errorMsg = `Failed to ensure chat exists for board ${msg.boardId}`;
            logger.error(errorMsg, {
                error:
                    error instanceof Error
                        ? {
                              message: error.message,
                              stack: error.stack,
                          }
                        : error,
                boardId: msg.boardId,
            });
            throw new Error(errorMsg);
        }
    }

    private async handleStreamChunks(options: {
        stream: Stream<ChatCompletionChunk>;
        ws: WebSocket;
        chat: Chat;
        logger: winston.Logger;
        boardId: string;
        controller: AbortController;
        userMessage: Message;
        itemId: string;
        msg: AiChatMsg<UserRequest>;
        context: AiChatLogContext;
    }) {
        const { stream, ws, chat, msg, logger, boardId, controller, userMessage, itemId, context } = options;
        logger.debug("Starting to handle stream chunks...");
        let assistantResponse = "";
        let usageMetadata: CompletionUsage | undefined;
        let isStopped = false;
        let isAnyChunkSent = false;
        let chunkCount = 0;
        let lastChunkTime = Date.now();

        const readableStream = stream.toReadableStream();

        let exMessage = null;
        if (msg.event?.action?.messageId) {
            const [foundToUpdate] = await db
                .select()
                .from(message)
                .where(eq(message.itemId, msg.event?.action?.messageId))
                .limit(1);
            exMessage = foundToUpdate || null;
        }

        readableStream.pipeTo(
            new WritableStream({
                write: async (chunk: Uint8Array) => {
                    try {
                        if (controller.signal.aborted) {
                            isStopped = true;
                            logger.debug(`Stream aborted for item ${itemId}`);
                            this.logOperationEnd(itemId, "error", "Stream aborted by user");
                            return;
                        }

                        const decodedChunk = new TextDecoder().decode(chunk);
                        const parsedChunk: ChatCompletionChunk = JSON.parse(decodedChunk);

                        chunkCount++;
                        const now = Date.now();
                        const timeSinceLastChunk = now - lastChunkTime;
                        lastChunkTime = now;

                        logger.debug("Stream chunk received", {
                            itemId,
                            chunkNumber: chunkCount,
                            chunkSize: decodedChunk.length,
                            timeSinceLastChunk,
                        });

                        if (parsedChunk.usage) {
                            usageMetadata = parsedChunk.usage;
                            logger.debug("Updated usage metadata:", usageMetadata);
                        }

                        const content = parsedChunk.choices?.[0]?.delta?.content;
                        if (content) {
                            assistantResponse += content;

                            const streamChunkMsg: AiChatMsg<ChatChunk> = {
                                type: "AiChat",
                                boardId: chat.boardId,
                                event: {
                                    type: "chunk",
                                    method: "ChatChunk",
                                    chatId: chat.id,
                                    content: content,
                                    itemId: itemId,
                                },
                            };
                            logger.debug("Sending chunk to client:", streamChunkMsg);
                            ws.send(JSON.stringify(streamChunkMsg));
                            if (!isAnyChunkSent) {
                                isAnyChunkSent = true;
                            }
                        }
                    } catch (error) {
                        const errorMsg = `Error processing stream chunk: ${error}`;
                        logger.error(errorMsg, { context });
                        this.logOperationEnd(itemId, "error", errorMsg);

                        this.sendErrorResponse(chat, ws, "Invalid chunk format", msg.boardId, msg.event.itemId, msg, {
                            operationContext: context,
                            wsMessage: msg,
                        });
                    }
                },
                close: async () => {
                    if (!isStopped && !controller.signal.aborted && isAnyChunkSent) {
                        logger.info("Stream completed successfully", {
                            itemId,
                            totalChunks: chunkCount,
                            totalDuration: Date.now() - context.startTime,
                        });
                        this.logOperationEnd(itemId, "success");
                        const encoder = getEncoding("cl100k_base");
                        const tokens = encoder.encode(assistantResponse);
                        logger.debug("Stream closed. Finalizing response...");
                        this.finalizeStream({
                            ws,
                            chat,
                            assistantResponse,
                            logger,
                            userMessage,
                            usageMetadata: {
                                completion_tokens: tokens.length,
                            },
                            itemId,
                            requestItemId: msg.event.requestItemId,
                            updatedFrom: exMessage?.id,
                        });
                    } else if (!isStopped && !controller.signal.aborted && !isAnyChunkSent) {
                        await this.saveMessage({
                            chat,
                            role: MessageRole.SYSTEM,
                            content: "Conversation stopped by API",
                            logger,
                            model: "system",
                        });
                        await this.reportToTelegramBot(
                            `Chat ${chat.id} stopped by API. Possible reason: response timeout exceeded`
                        );
                        this.sendErrorResponse(
                            chat,
                            ws,
                            `Chat ${chat.id} stopped by API. Possible reason: response timeout exceeded`
                        );
                    } else {
                        await this.saveMessage({
                            chat,
                            role: MessageRole.SYSTEM,
                            content: "Conversation manually stopped by user",
                            logger,
                            model: "system",
                        });

                        await this.reportToTelegramBot(`Chat ${chat.id} manually stopped by user`);
                    }

                    this.activeStreams.delete(itemId);
                },
                abort: async (err) => {
                    const errorMsg = `Streaming error: ${err}`;
                    logger.error(errorMsg, { context });
                    this.logOperationEnd(itemId, "error", errorMsg);
                    await this.reportToTelegramBot(errorMsg, { boardId: msg.boardId, msg });

                    if (!isStopped) {
                        this.sendErrorResponse(
                            chat,
                            ws,
                            err instanceof Error ? err.message : "Stream error",
                            msg.boardId,
                            msg.event.itemId,
                            msg
                        );
                    }

                    this.activeStreams.delete(itemId);
                },
            })
        );
    }

    private async finalizeStream(options: {
        ws: WebSocket;
        chat: Chat;
        assistantResponse: string;
        logger: winston.Logger;
        userMessage: Message;
        itemId: string;
        requestItemId: string;
        usageMetadata?: Partial<CompletionUsage>;
        updatedFrom?: number | null;
    }) {
        const { ws, chat, updatedFrom, assistantResponse, logger, userMessage, usageMetadata, itemId, requestItemId } =
            options;
        logger.debug("Finalizing stream response...");

        const assistantMessage = await this.saveMessage({
            chat,
            role: MessageRole.ASSISTANT,
            content: assistantResponse,
            logger,
            tokensUsed: usageMetadata?.completion_tokens,
            generatedFrom: userMessage.id,
            itemId: itemId,
            updatedFrom: updatedFrom,
            model: userMessage.model,
            // previousMessageId: userMessage.id,
        });

        const endChunk: AiChatMsg<ChatChunk> = {
            type: "AiChat",
            boardId: chat.boardId,
            event: {
                method: "ChatChunk",
                type: "end",
                usage: usageMetadata,
                chatId: chat.id,
                itemId: itemId,
                assistantMessage: assistantMessage.id || null,
                userMessage: assistantMessage.generatedFrom || null,
            },
        };

        logger.debug("Sending end chunk to WebSocket:", endChunk);
        ws.send(JSON.stringify(endChunk));

        if (chat && this.activeOperations.has(itemId)) {
            const context = this.activeOperations.get(itemId);
            if (context?.pipelineSteps) {
                context.pipelineSteps[9].status = "success"; // Save Assistant Message
                context.pipelineSteps[10].status = "success"; // Finalize Response
            }
        }
    }

    private async saveAudioMessage(options: {
        chat: Chat;
        role: MessageRole;
        logger: winston.Logger;
        symbolsUsed: number;
        model: "tts-1-hd";
    }) {
        const { chat, role, logger, model, symbolsUsed } = options;

        logger.debug("Saving audio message to database:", {
            chatId: chat.id,
            role,
        });

        const [savedMessage] = await db
            .insert(message)
            .values({
                chatId: chat.id,
                role,
                model,
                symbolsUsed,
            })
            .returning();

        logger.debug("Inserted new audio message:", { savedMessage });

        return savedMessage;
    }

    private async saveMessage(options: {
        chat: Chat;
        role: MessageRole;
        content: string;
        logger: winston.Logger;
        status?: MessageStatus;
        tokensUsed?: number;
        updatedFrom?: number | null;
        generatedFrom?: number;
        itemId?: string;
        previousMessageId?: number;
        model: string;
    }) {
        const {
            chat,
            role,
            content,
            logger,
            status = MessageStatus.DONE,
            updatedFrom,
            generatedFrom,
            itemId,
            previousMessageId,
            model,
        } = options;

        const tokensUsed = options.tokensUsed ?? this.countTokens(content);
        const messageContext = {
            chatId: chat.id,
            boardId: chat.boardId,
            role,
            tokensUsed,
            status,
            model,
            itemId,
            previousMessageId,
            updatedFrom,
            generatedFrom,
            contentLength: content.length,
        };

        logger.debug("Saving message to database:", messageContext);

        try {
            let savedMessage;

            if (updatedFrom && !isNaN(Number(updatedFrom))) {
                [savedMessage] = await db
                    .update(message)
                    .set({
                        role,
                        content,
                        tokensUsed,
                        status,
                        generatedFrom,
                        itemId,
                        previousMessageId,
                    })
                    .where(eq(message.id, updatedFrom))
                    .returning();

                logger.debug("Updated existing message:", {
                    messageId: savedMessage.id,
                    ...messageContext,
                });
            } else {
                [savedMessage] = await db
                    .insert(message)
                    .values({
                        chatId: chat.id,
                        role,
                        content,
                        tokensUsed,
                        status,
                        updatedFrom,
                        generatedFrom,
                        itemId,
                        previousMessageId,
                        model,
                    })
                    .returning();

                logger.debug("Inserted new message:", {
                    messageId: savedMessage.id,
                    ...messageContext,
                });
            }

            if (!savedMessage) {
                throw new Error("Failed to save message to database");
            }

            return savedMessage;
        } catch (error) {
            const errorMsg = `Failed to save message for chat ${chat.id}`;
            logger.error(errorMsg, {
                error:
                    error instanceof Error
                        ? {
                              message: error.message,
                              stack: error.stack,
                          }
                        : error,
                context: messageContext,
            });
            throw new Error(errorMsg);
        }
    }

    private async sendErrorResponse(
        chat: Chat | null,
        ws: WebSocket,
        errorMessage: string,
        boardId?: string,
        itemId?: string,
        message?: AiChatMsg<any>,
        tgContext?: {
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
                activeOperations: Array<{ itemId: string } & AiChatLogContext>;
                activeStreams: string[];
            };
            wsMessage?: AiChatMsg<any>;
        }
    ) {
        const errorContext = {
            boardId: chat?.boardId || boardId || "unknown",
            chatId: String(chat?.id || "unknown"),
            timestamp: new Date().toISOString(),
            activeOperations: Array.from(this.activeOperations.entries()).map(([key, value]) => ({
                ...value,
                itemId: key,
            })),
            activeStreams: Array.from(this.activeStreams.keys()),
        };

        const errorMsg = `Error response for chat on board ${errorContext.boardId}: ${errorMessage}`;
        this.logger.error(errorMsg, { context: errorContext });

        await this.telegramService.broadcastMessage(errorMsg, {
            boardId: chat?.boardId || boardId || "",
            msg: tgContext?.wsMessage || message,
            operationContext: tgContext?.operationContext,
            errorContext: tgContext?.errorContext || errorContext,
        });

        const errorChunk: AiChatMsg<ChatChunk> = {
            type: "AiChat",
            boardId: chat?.boardId || boardId || "",
            event: {
                type: "error",
                error: errorMessage,
                chatId: chat?.id || -1,
                method: "ChatChunk",
                itemId: itemId || "",
            },
        };

        ws.send(JSON.stringify(errorChunk));
    }
}
