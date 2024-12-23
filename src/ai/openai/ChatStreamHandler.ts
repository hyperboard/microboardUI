import { asc, eq, inArray } from "drizzle-orm";
import WebSocket from "ws";
import { OpenAI } from ".";
import { db } from "drizzle/db";
import { AiChatMsg, ChatChunk, StopGeneration, UserRequest } from "WebSocket/ai-chat";
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

            this.broadcastChunkToBoardClients(this.boardClients, boardId, stopChunk);
        } catch (error) {
            logger.error(`Error stopping conversation for board ${boardId}:`, error);

            this.sendErrorResponse(
                foundedChat,
                ws,
                error instanceof Error ? error.message : "Failed to stop conversation"
            );
        }
    }

    public async handleUserRequest(options: {
        msg: AiChatMsg<UserRequest>;
        ws: WebSocket;
        logger: winston.Logger;
        boardClients: Map<string, WebSocket.WebSocket[]>;
    }) {
        const { msg, ws, logger, boardClients } = options;
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
            const contextStrings = await this.getContextStrings(msg.event.context, logger);

            const boardContextStrings = msg.event.boardContext || [];
            // const combinedContext = [...contextStrings, ...boardContextStrings];
            userPrompt = getChatUserPrompt({
                idea: msg.event.idea,
                context: contextStrings.length > 0 ? contextStrings.join(", ") : "",
                boardContext: boardContextStrings.length > 0 ? boardContextStrings.join(", ") : "",
                searchResults: searchResult,
                level: msg.event?.action?.level || undefined,
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

            const userMessage = await this.saveMessage({
                chat,
                role: MessageRole.USER,
                content: msg.event.idea,
                logger,
                tokensUsed: tokens.length,
            });

            logger.debug("Generating chat completion stream...");
            logger.debug("Context messages: ", JSON.stringify(contextMessages));

            const stream = await this.openai.generateStreamChatCompletion(contextMessages, {
                model: msg.event.model || "gpt-4o",
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
            // logger.debug("KEYS: ", this.activeStreams.keys.toString());

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

    private async getContextStrings(contextIds: number[], logger: winston.Logger): Promise<string[]> {
        logger.debug("Fetching context messages from database for IDs:", contextIds);
        const contextItems = await db
            .select()
            .from(message)
            .where(inArray(message.id, contextIds))
            .orderBy(asc(message.id));

        logger.debug(
            "Fetched context strings:",
            contextItems.map((item) => item.content)
        );
        return contextItems.map((item) => item.content);
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

    private handleStreamChunks(options: {
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
                            this.broadcastChunkToBoardClients(this.boardClients, chat.boardId, streamChunkMsg);
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
        usageMetadata?: Partial<CompletionUsage>;
    }) {
        const { ws, chat, assistantResponse, logger, userMessage, usageMetadata, itemId } = options;
        logger.debug("Finalizing stream response...");
        logger.debug("Saving assistant response to database...");
        await this.saveMessage({
            chat,
            role: MessageRole.ASSISTANT,
            content: assistantResponse,
            logger,
            tokensUsed: usageMetadata?.completion_tokens || 0,
            generatedFrom: userMessage.id,
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
            },
        };

        logger.debug("Sending end chunk to WebSocket:", endChunk);
        this.broadcastChunkToBoardClients(this.boardClients, chat.boardId, endChunk);
        // ws.send(JSON.stringify(endChunk));
    }

    private async saveMessage(options: {
        chat: Chat;
        role: MessageRole;
        content: string;
        logger: winston.Logger;
        status?: MessageStatus;
        tokensUsed?: number;
        updatedFrom?: number;
        generatedFrom?: number;
    }) {
        const { chat, role, status, content, logger, tokensUsed = 0, updatedFrom, generatedFrom } = options;
        logger.debug("Saving message to database:", { chatId: chat.id, role, content, tokensUsed });
        const [savedMessage] = await db
            .insert(message)
            .values({
                chatId: chat.id,
                role,
                content,
                tokensUsed,
                status: status || MessageStatus.DONE,
                updatedFrom: updatedFrom ? updatedFrom : undefined,
                generatedFrom: generatedFrom ? generatedFrom : undefined,
            })
            .returning();

        if (updatedFrom && !isNaN(Number(updatedFrom))) {
            const [updatedUserMessage] = await db
                .update(message)
                .set({
                    status: MessageStatus.ARCHIVED,
                })
                .where(eq(message.id, updatedFrom))
                .returning();

            await db
                .update(message)
                .set({
                    status: MessageStatus.ARCHIVED,
                })
                .where(eq(message.generatedFrom, updatedUserMessage.id))
                .returning();
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
            this.broadcastChunkToBoardClients(this.boardClients, chat.boardId, errorChunk);
        } else {
            ws.send(JSON.stringify(errorChunk));
        }
    }

    private broadcastChunkToBoardClients(
        boardClients: Map<string, WebSocket[]>,
        boardUUID: string,
        chunk: AiChatMsg<ChatChunk>
    ) {
        const clients = boardClients.get(boardUUID) ?? [];
        const content = JSON.stringify(chunk);
        for (const client of clients) {
            client.send(content);
        }
    }
}
