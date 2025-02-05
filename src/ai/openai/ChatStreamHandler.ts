import { asc, eq, inArray, ne, and, desc, gte, lte, sql } from "drizzle-orm";
import WebSocket from "ws";
import { OpenAI } from ".";
import { db } from "drizzle/db";
import {
    AiChatMsg,
    ChatChunk,
    GenerateImageEvent,
    GenerateImageResponse,
    GetMessageList,
    MessageList,
    StopGeneration,
    UserRequest,
} from "WebSocket/ai-chat";
import { Chat, chat, Message, message, MessageRole, MessageStatus } from "drizzle/entities/ai";
import {
    ChatCompletionChunk,
    ChatCompletionContentPart,
    ChatCompletionMessageParam,
    CompletionUsage,
} from "openai/resources";
import { Stream } from "openai/streaming";
import {
    getAdjustReadingLevelPrompt,
    getAdjustTextLengthPrompt,
    getChatQueryGeneratorPrompt,
    getChatSystemPrompt,
    getChatUserPrompt,
    getEmojiPrompt,
} from "Routes/V1/AI/prompts/chat";
import winston from "winston";
import { getEncoding } from "js-tiktoken";
import { getJson } from "serpapi";
import { modelLimits } from "drizzle/entities/plans";
import { boardOwner, boards } from "drizzle/entities";
import { GenerateImageOptions, ImageGenerator } from "WebSocket/image-generator";
import { getCurrentModelLimits, getCurrentUserPlan } from "Routes/V1/Billing/utils";
import { Redis } from "Redis";
import { TelegramService } from "services/TelegramService";

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

    boardClients = new Map<string, WebSocket.WebSocket[]>();

    private activeStreams = new Map<
        string,
        {
            stream: Stream<ChatCompletionChunk> & {
                _request_id?: string | null;
            };
            controller: AbortController;
        }
    >();

    constructor(openai: OpenAI, logger: winston.Logger, redis: Redis, telegramService: TelegramService) {
        this.openai = openai;
        this.usageLimitChecker = new UsageLimitChecker(logger);
        this.redis = redis;
        this.telegramService = telegramService;
    }

    private async reportToTelegramBot(text: string, meta?: { boardId?: string; msg?: AiChatMsg }) {
        const boardId = meta?.boardId || meta?.msg?.boardId || "unknown";
        await this.telegramService.broadcastMessage(text, { boardId });
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

            const boardStreamEntry = this.activeStreams.get(itemId);
            logger.debug("ABORT STREAM:", { entry: boardStreamEntry });

            if (boardStreamEntry) {
                logger.debug(`Aborting stream for item ${itemId}`);
                boardStreamEntry.controller.abort();

                this.activeStreams.delete(itemId);

                logger.debug(`Stream for item ${itemId} successfully aborted`);
            } else {
                logger.warn(`No active stream found for item ${itemId}`);
                return;
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
                msg.boardId
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
        this.boardClients = boardClients;
        const boardOwnerId = await this.getBoardOwner(msg.boardId);
        const imageLimits = await this.usageLimitChecker.checkImageGenerationLimits(boardOwnerId);
        const chat = await this.ensureChatExists(msg, logger);

        if (!imageLimits.canProceed) {
            ws.send(
                JSON.stringify({
                    type: "AiChat",
                    boardId: msg.boardId,
                    event: {
                        method: "GenerateImage",
                        status: "error",
                        error: imageLimits.error,
                        message: "LimitExceeded",
                    },
                })
            );
            return;
        }

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

        console.log("Message to send(Generating): ", generatingMsg);
        ws.send(JSON.stringify(generatingMsg));

        try {
            const baseOptions = {
                prompt: msg.event.prompt,
                itemId: msg.event.itemId,
            };

            let options: GenerateImageOptions = {} as GenerateImageOptions;
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
                        model: msg.event.options.model || "dall-e-2",
                        size: msg.event.options?.size,
                    };
                    break;
                }
                case "dall-e-3": {
                    options = {
                        ...baseOptions,
                        model: msg.event.options.model || "dall-e-3",
                        size: msg.event.options?.size,
                    };
                    break;
                }
                case "flux-schnell":
                case "flux-pro": {
                    options = {
                        ...baseOptions,
                        model: msg.event.options.model || "flux-schnell",
                        aspectRatio: msg.event.options?.aspect_ratio,
                    };
                    break;
                }
            }

            const result = await imageGenerator.generateImage(options);

            await this.saveMessage({
                chat,
                role: MessageRole.ASSISTANT,
                content: result.base64 || "",
                logger,
                model: "image-generation",
            });

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

            console.log("Message to send(Generate Image): ", msgToSend);
            ws.send(JSON.stringify(msgToSend));
        } catch (error) {
            const errorMsg = `Error generating image for chat ${chat.id}: ${error}`;
            console.error(errorMsg);
            await this.reportToTelegramBot(errorMsg, { boardId: msg.boardId, msg: msg });

            const errorResponse: AiChatMsg<GenerateImageResponse> = {
                type: "AiChat",
                boardId: msg.boardId,
                event: {
                    method: "GenerateImage",
                    status: "error",
                    itemId: msg.event.itemId,
                    base64: null,
                    imageUrl: null,
                    message: `Image generation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
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
        const boardOwnerId = await this.getBoardOwner(msg.boardId);
        const usageCheck = await this.usageLimitChecker.checkUserLimits(boardOwnerId, msg.event.model || "gpt-4o-mini");
        console.log("usage check", usageCheck);
        if (!usageCheck.canProceed) {
            this.sendErrorResponse(null, ws, usageCheck.error || "LimitExceeded", msg.boardId);
            return;
        }
        const itemId = msg.event.itemId;
        this.boardClients = boardClients;
        logger.debug("Received user request:", msg);

        try {
            const controller = new AbortController();

            const existingBoardStream = this.activeStreams.get(itemId);
            if (existingBoardStream) {
                existingBoardStream.controller.abort();
                this.activeStreams.delete(itemId);
            }

            logger.debug("Ensuring chat existence...");
            const chat = await this.ensureChatExists(msg, logger);

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

            const searchQuery = await this.fetchQuery(msg.event.idea);
            console.log("Search query: ", searchQuery);
            let searchResult = "";
            if (searchQuery) {
                const googleResponse = await this.serpapi.getJson(searchQuery);
                console.log("Google response: ", googleResponse);
                const organic = googleResponse.organic;

                if (organic) {
                    console.log("Organic: ", organic);
                    searchResult = `Internet search for user's query: ${JSON.stringify(organic)}`;
                }
            }
            logger.debug("search result: ", searchResult);

            let userPrompt = "";
            logger.debug("Fetching context strings, if any...");
            const simpleContextStrings = await this.getContextStrings(msg.event.context, logger);
            const messagesInContext = await this.getContextMessages(msg, logger);

            const contextStrings = messagesInContext.map((m) => JSON.stringify({ content: m.content, role: m.role }));
            const boardContextStrings = msg.event.boardContext || [];
            userPrompt = getChatUserPrompt({
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

            logger.debug("user prompt: ", userPrompt);
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

            logger.debug("Generating chat completion stream...");
            logger.debug("Context messages: ", JSON.stringify(contextMessages));

            let stream: Stream<ChatCompletionChunk> | null = null;

            if (msg.event.model?.startsWith("deepseek-")) {
                stream = await this.openai.generateStreamChatCompletion(contextMessages, {
                    model: msg.event.model || "gpt-4o-mini",
                    signal: controller.signal,
                    customModel: msg.event.model as "deepseek-chat" | "deepseek-reasoner",
                });
            } else {
                stream = await this.openai.generateStreamChatCompletion(contextMessages, {
                    model: msg.event.model || "gpt-4o-mini",
                    signal: controller.signal,
                });
            }

            if (!stream) {
                console.error("Failed to create stream");
                this.sendErrorResponse(chat, ws, "Failed to create stream");
                return;
            }

            this.activeStreams.set(itemId, {
                stream,
                controller,
            });
            logger.debug(`Stream created for item: ${itemId} `, {
                controller: this.activeStreams.get(itemId)?.controller,
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
                itemId,
                msg,
            });
        } catch (error) {
            const errorMsg = `Error handling user request for board ${msg.boardId}: ${error}`;
            console.error(errorMsg);
            await this.reportToTelegramBot(errorMsg, { boardId: msg.boardId, msg: msg });
            this.sendErrorResponse(null, ws, error instanceof Error ? error.message : "Unknown error", msg.boardId);
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
        logger.debug("Item ID provided, fetching existing chat...");
        let [boardChat] = await db.select().from(chat).where(eq(chat.boardId, msg.boardId)).limit(1);
        if (!boardChat) {
            const [newChat] = await db.insert(chat).values({ boardId: msg.boardId }).returning();

            return newChat;
        }

        logger.debug("Existing chat found or created:", boardChat);
        return boardChat;
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
    }) {
        const { stream, ws, chat, msg, logger, boardId, controller, userMessage, itemId } = options;
        logger.debug("Starting to handle stream chunks...");
        let assistantResponse = "";
        let usageMetadata: CompletionUsage | undefined;
        let isStopped = false;

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
                            return;
                        }

                        const decodedChunk = new TextDecoder().decode(chunk);
                        const parsedChunk: ChatCompletionChunk = JSON.parse(decodedChunk);

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
                        }
                    } catch (error) {
                        const errorMsg = `Error processing stream chunk for chat ${chat.id}: ${error}`;
                        logger.error(errorMsg);
                        await this.reportToTelegramBot(errorMsg, { boardId: msg.boardId, msg: msg });
                        this.sendErrorResponse(chat, ws, "Invalid chunk format");
                    }
                },
                close: async () => {
                    if (!isStopped && !controller.signal.aborted) {
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
                    const errorMsg = `Streaming error for chat ${chat.id}: ${err}`;
                    console.error(errorMsg);
                    await this.reportToTelegramBot(errorMsg, { boardId: msg.boardId, msg: msg });

                    if (!isStopped) {
                        this.sendErrorResponse(chat, ws, err instanceof Error ? err.message : "Stream error");
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

        logger.debug("Saving message to database:", {
            chatId: chat.id,
            role,
            content,
            tokensUsed,
            previousMessageId,
        });

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

            logger.debug("Updated existing message:", { updatedFrom, savedMessage });
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

            logger.debug("Inserted new message:", { savedMessage });
        }

        return savedMessage;
    }

    private async sendErrorResponse(chat: Chat | null, ws: WebSocket, errorMessage: string, boardId?: string) {
        const errorMsg = `Error response for chat ${chat?.id || "unknown"}: ${errorMessage}`;
        console.error(errorMsg);
        await this.reportToTelegramBot(errorMsg, { boardId: chat?.boardId || boardId || "" });

        const errorChunk: AiChatMsg<ChatChunk> = {
            type: "AiChat",
            boardId: chat?.boardId || boardId || "",
            event: {
                type: "error",
                error: errorMessage,
                chatId: chat?.id || -1,
                method: "ChatChunk",
                itemId: "",
            },
        };

        ws.send(JSON.stringify(errorChunk));
    }
}
