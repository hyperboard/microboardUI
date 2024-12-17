import { asc, inArray } from "drizzle-orm";
import WebSocket from "ws";
import { OpenAI } from ".";
import { db } from "drizzle/db";
import { AiChatMsg, ChatChunk, StopGeneration, UserRequest } from "WebSocket/ai-chat";
import { Chat, chat, Message, message, MessageRole, MessageStatus } from "drizzle/entities/ai";
import { ChatCompletionChunk, ChatCompletionMessageParam, CompletionUsage } from "openai/resources";
import { Stream } from "openai/streaming";
import { getChatSystemPrompt, getChatUserPrompt } from "Routes/V1/AI/prompts/chat";
import { eq } from "drizzle-orm";
import winston from "winston";

export class ChatStreamHandler {
    private openai: OpenAI;
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

            await this.saveMessage(foundedChat, MessageRole.SYSTEM, "Conversation manually stopped by user", logger);
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

    async handleUserRequest(options: {
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

            if (msg.event.context.length > 0) {
                logger.debug("Fetching context strings, if any...");
                const contextStrings = await this.getContextStrings(msg.event.context, logger);

                const boardContextStrings = msg.event.boardContext || [];
                const combinedContext = [...contextStrings, ...boardContextStrings];

                if (combinedContext.length > 0) {
                    contextMessages.push({
                        role: MessageRole.USER,
                        content: getChatUserPrompt(
                            msg.event.idea,
                            contextStrings.join(", "),
                            boardContextStrings.join(", ")
                        ),
                    });
                } else {
                    contextMessages.push({
                        role: MessageRole.SYSTEM,
                        content: getChatSystemPrompt(),
                    });
                    await this.saveMessage(chat, MessageRole.SYSTEM, getChatSystemPrompt(), logger);
                }
            }

            contextMessages.push({
                role: MessageRole.USER,
                content: msg.event.idea,
            });

            const userMessage = await this.saveMessage(chat, MessageRole.USER, msg.event.idea, logger);

            logger.debug("Generating chat completion stream...");
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

    private async prepareContextMessages(
        event: UserRequest,
        logger: winston.Logger
    ): Promise<ChatCompletionMessageParam[]> {
        logger.debug("Preparing context messages for event:", event);
        const contextMessages: ChatCompletionMessageParam[] = [];

        if (event.context && event.context.length > 0) {
            logger.debug("Fetching context chats...");
            const contextChats = await db
                .select()
                .from(message)
                .where(inArray(message.id, event.context))
                .orderBy(asc(message.id));

            contextMessages.push(
                ...contextChats.map((msg) => ({
                    role: msg.role as MessageRole,
                    content: msg.content,
                }))
            );
        }

        logger.debug("Adding user idea to context messages...");
        contextMessages.push({
            role: MessageRole.USER,
            content: event.idea,
        });

        logger.debug("Prepared context messages:", contextMessages);
        return contextMessages;
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
    }) {
        const { stream, ws, chat, logger, boardId, controller, userMessage, itemId } = options;
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
                        logger.debug("Stream closed. Finalizing response...");
                        this.finalizeStream({
                            ws,
                            chat,
                            assistantResponse,
                            logger,
                            userMessage,
                            usageMetadata,
                            itemId,
                        });
                    } else {
                        this.saveMessage(chat, MessageRole.SYSTEM, "Conversation manually stopped by user", logger);
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
        usageMetadata?: CompletionUsage;
    }) {
        const { ws, chat, assistantResponse, logger, userMessage, usageMetadata, itemId } = options;
        logger.debug("Finalizing stream response...");
        logger.debug("Saving assistant response to database...");
        await this.saveMessage(
            chat,
            MessageRole.ASSISTANT,
            assistantResponse,
            logger,
            usageMetadata?.completion_tokens || 0,
            undefined,
            userMessage.id
        );

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

    private async saveMessage(
        chat: Chat,
        role: MessageRole,
        content: string,
        logger: winston.Logger,
        tokensUsed = 0,
        updatedFrom?: number,
        generatedFrom?: number
    ) {
        logger.debug("Saving message to database:", { chatId: chat.id, role, content, tokensUsed });
        const [savedMessage] = await db
            .insert(message)
            .values({
                chatId: chat.id,
                role,
                content,
                tokensUsed,
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
