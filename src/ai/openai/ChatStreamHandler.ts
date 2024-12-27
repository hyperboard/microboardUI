import { asc, eq, inArray, ne, and, desc, gte, lte } from "drizzle-orm";
import WebSocket from "ws";
import { OpenAI } from ".";
import { db } from "drizzle/db";
import { AiChatMsg, ChatChunk, GetMessageList, MessageList, StopGeneration, UserRequest } from "WebSocket/ai-chat";
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
import { ModelLimit, userModelUsage, userPlans } from "drizzle/entities/plans";
import { boardOwner, boards } from "drizzle/entities";
import { PLAN_MODEL_LIMITS } from "drizzle/scripts/plans";

class UsageLimitChecker {
    private readonly defaultPlanId = "free";

    private async getActivePlan(userId: number) {
        if (userId === 0) {
            return null;
        }

        const [userPlan] = await db
            .select()
            .from(userPlans)
            .where(and(eq(userPlans.userId, userId), eq(userPlans.status, "active")))
            .limit(1);

        return userPlan;
    }

    private findPlanLimit(planId: string, modelId: string): Omit<ModelLimit, "id"> | undefined {
        return PLAN_MODEL_LIMITS.find((limit) => limit.planId === planId && limit.modelId === modelId);
    }

    public async checkUserLimits(
        userId: number,
        modelId: string
    ): Promise<{
        canProceed: boolean;
        error?: string;
    }> {
        const userPlan = await this.getActivePlan(userId);
        const planId = userPlan?.planId || this.defaultPlanId;
        const planLimit = this.findPlanLimit(planId, modelId);

        if (!planLimit?.isEnabled) {
            return { canProceed: false, error: "Model not available in your plan" };
        }

        if (!planLimit.dailyRequestLimit && !planLimit.weeklyRequestLimit) {
            return { canProceed: true };
        }

        const now = new Date();
        const startOfDay = new Date(now.setHours(0, 0, 0, 0));
        const endOfDay = new Date(now.setHours(23, 59, 59, 999));
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        const endOfWeek = new Date(new Date(startOfWeek).setDate(startOfWeek.getDate() + 6));

        await Promise.all([
            this.ensureUsageRecord(userId, modelId, startOfDay, endOfDay, "daily"),
            this.ensureUsageRecord(userId, modelId, startOfWeek, endOfWeek, "weekly"),
        ]);

        const [[dailyUsage], [weeklyUsage]] = await Promise.all([
            db
                .select()
                .from(userModelUsage)
                .where(
                    and(
                        eq(userModelUsage.userId, userId),
                        eq(userModelUsage.modelId, modelId),
                        eq(userModelUsage.periodType, "daily")
                    )
                )
                .limit(1),
            db
                .select()
                .from(userModelUsage)
                .where(
                    and(
                        eq(userModelUsage.userId, userId),
                        eq(userModelUsage.modelId, modelId),
                        eq(userModelUsage.periodType, "weekly")
                    )
                )
                .limit(1),
        ]);

        if (
            (planLimit.dailyRequestLimit && dailyUsage?.requestCount >= planLimit.dailyRequestLimit) ||
            (planLimit.weeklyRequestLimit && weeklyUsage?.requestCount >= planLimit.weeklyRequestLimit)
        ) {
            return { canProceed: false, error: "Request limit exceeded" };
        }

        return { canProceed: true };
    }

    private async ensureUsageRecord(
        userId: number,
        modelId: string,
        periodStart: Date,
        periodEnd: Date,
        periodType: "daily" | "weekly"
    ): Promise<void> {
        const [existingRecord] = await db
            .select()
            .from(userModelUsage)
            .where(
                and(
                    eq(userModelUsage.userId, userId),
                    eq(userModelUsage.modelId, modelId),
                    eq(userModelUsage.periodType, periodType)
                )
            )
            .limit(1);

        if (!existingRecord) {
            await db.insert(userModelUsage).values({
                id: crypto.randomUUID(),
                userId,
                modelId,
                requestCount: 0,
                periodStart,
                periodEnd,
                periodType,
            });
        }
    }

    public async incrementUsage(userId: number, modelId: string): Promise<void> {
        const now = new Date();
        const todayStart = new Date(now.setHours(0, 0, 0, 0));
        const todayEnd = new Date(now.setHours(23, 59, 59, 999));

        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        await Promise.all([
            this.updatePeriodUsage(userId, modelId, "daily", todayStart, todayEnd),
            this.updatePeriodUsage(userId, modelId, "weekly", weekStart, weekEnd),
        ]);
    }

    public async updatePeriodUsage(
        userId: number,
        modelId: string,
        periodType: "daily" | "weekly",
        startDate: Date,
        endDate: Date
    ): Promise<void> {
        const [existing] = await db
            .select()
            .from(userModelUsage)
            .where(
                and(
                    eq(userModelUsage.userId, userId),
                    eq(userModelUsage.modelId, modelId),
                    eq(userModelUsage.periodType, periodType)
                )
            )
            .limit(1);

        if (existing) {
            await db
                .update(userModelUsage)
                .set({ requestCount: existing.requestCount + 1 })
                .where(eq(userModelUsage.id, existing.id));
        } else {
            await db.insert(userModelUsage).values({
                id: crypto.randomUUID(),
                userId,
                modelId,
                requestCount: 1,
                periodStart: startDate,
                periodEnd: endDate,
                periodType,
            });
        }
    }
}

class SerpApi {
    private apiKey = "ecab67b89779cf9339a9f60ddaecc819f25c7327876545cbd04ec100fc3c0945";

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
    private usageLimitChecker = new UsageLimitChecker();
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

    constructor(openai: OpenAI) {
        this.openai = openai;
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
            logger.debug(`Attempting to stop conversation for board ${boardId}`);

            const boardStreamEntry = this.activeStreams.get(msg.boardId);
            logger.debug("ABORT STREAM:", { entry: boardStreamEntry });

            if (boardStreamEntry) {
                logger.debug(`Aborting stream for board ${boardId}`);
                boardStreamEntry.controller.abort();

                this.activeStreams.delete(boardId);

                logger.debug(`Stream for board ${boardId} successfully aborted`);
            } else {
                logger.warn(`No active stream found for board ${boardId}`);
                return;
            }

            const foundedChat = await this.ensureChatExists(msg, logger);

            await this.saveMessage({
                chat: foundedChat,
                role: MessageRole.SYSTEM,
                content: "Conversation manually stopped by user",
                logger,
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

            this.broadcastToBoardClients(this.boardClients, boardId, stopChunk);
        } catch (error) {
            logger.error(`Error stopping conversation for board ${boardId}:`, error);

            this.sendErrorResponse(
                foundedChat,
                ws,
                error instanceof Error ? error.message : "Failed to stop conversation"
            );
        }
    }

    public async handleGetMessageList({
        msg,
        logger,
        boardClients,
    }: {
        msg: AiChatMsg<GetMessageList>;
        logger: winston.Logger;
        boardClients: Map<string, WebSocket.WebSocket[]>;
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

        this.broadcastToBoardClients(this.boardClients, msg.boardId, msgToSend);
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
        // const usageCheck = await this.usageLimitChecker.checkUserLimits(boardOwnerId, msg.event.model || "gpt-4o-mini");
        const usageCheck = await this.usageLimitChecker.checkUserLimits(boardOwnerId, "gpt-4o-mini");
        if (!usageCheck.canProceed) {
            this.sendErrorResponse(null, ws, usageCheck.error || "LimitExceeded");
            return;
        }
        const itemId = msg.event.itemId;
        this.boardClients = boardClients;
        logger.debug("Received user request:", msg);

        try {
            const controller = new AbortController();

            const existingBoardStream = this.activeStreams.get(msg.boardId);
            if (existingBoardStream) {
                existingBoardStream.controller.abort();
                this.activeStreams.delete(msg.boardId);
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
            });

            // await this.usageLimitChecker.incrementUsage(boardOwnerId, msg.event.model || "gpt-4o");
            await this.usageLimitChecker.incrementUsage(boardOwnerId, "gpt-4o-mini");

            logger.debug("Generating chat completion stream...");
            logger.debug("Context messages: ", JSON.stringify(contextMessages));

            const stream = await this.openai.generateStreamChatCompletion(contextMessages, {
                // model: msg.event.model || "gpt-4o",
                model: "gpt-4o-mini",
                signal: controller.signal,
            });

            if (!stream) {
                console.error("Failed to create stream");
                this.sendErrorResponse(chat, ws, "Failed to create stream");
                return;
            }

            this.activeStreams.set(msg.boardId, {
                stream,
                controller,
            });
            logger.debug(`Stream created for board: ${msg.boardId} `, {
                controller: this.activeStreams.get(msg.boardId)?.controller,
                size: this.activeStreams.size,
            });

            logger.debug("Handling stream chunks...");
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
            console.error("Error in handleUserRequest:", error);
            this.sendErrorResponse(null, ws, error instanceof Error ? error.message : "Unknown error");
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
        logger.debug("Board ID provided, fetching existing chat...");
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
                write: (chunk: Uint8Array) => {
                    try {
                        if (controller.signal.aborted) {
                            isStopped = true;
                            logger.debug(`Stream aborted for board ${boardId}`);
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
                            logger.debug("Sending chunk to board clients:", streamChunkMsg);
                            this.broadcastToBoardClients(this.boardClients, chat.boardId, streamChunkMsg);
                        }
                    } catch (error) {
                        console.error("Error processing stream chunk:", error);
                        this.sendErrorResponse(chat, ws, "Invalid chunk format");
                    }
                },
                close: () => {
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
                        this.saveMessage({
                            chat,
                            role: MessageRole.SYSTEM,
                            content: "Conversation manually stopped by user",
                            logger,
                        });
                    }

                    this.activeStreams.delete(boardId);
                },
                abort: (err) => {
                    console.error("Streaming error:", err);

                    if (!isStopped) {
                        this.sendErrorResponse(chat, ws, err instanceof Error ? err.message : "Stream error");
                    }

                    this.activeStreams.delete(boardId);
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
        this.broadcastToBoardClients(this.boardClients, chat.boardId, endChunk);
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
                })
                .returning();

            logger.debug("Inserted new message:", { savedMessage });
        }

        return savedMessage;
    }

    private sendErrorResponse(chat: Chat | null, ws: WebSocket, errorMessage: string) {
        console.error("Sending error response:", errorMessage);
        const errorChunk: AiChatMsg<ChatChunk> = {
            type: "AiChat",
            boardId: chat?.boardId || "",
            event: {
                type: "error",
                error: errorMessage,
                chatId: chat?.id || -1,
                method: "ChatChunk",
                itemId: "",
            },
        };
        if (chat) {
            this.broadcastToBoardClients(this.boardClients, chat.boardId, errorChunk);
        } else {
            ws.send(JSON.stringify(errorChunk));
        }
    }

    private broadcastToBoardClients(
        boardClients: Map<string, WebSocket[]>,
        boardUUID: string,
        message: AiChatMsg<any>
    ) {
        const clients = boardClients.get(boardUUID) ?? [];
        const content = JSON.stringify(message);
        for (const client of clients) {
            client.send(content);
        }
    }
}
