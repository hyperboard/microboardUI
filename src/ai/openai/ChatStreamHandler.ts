import { asc, inArray } from "drizzle-orm";
import WebSocket from "ws";
import { OpenAI } from ".";
import { db } from "drizzle/db";
import { AiChatMsg, ChatChunk, UserRequest } from "WebSocket/ai-chat";
import { Chat, chat, message } from "drizzle/entities/ai";
import { ChatCompletionChunk, ChatCompletionMessageParam, CompletionUsage } from "openai/resources";
import { Stream } from "openai/streaming";
import { getChatSystemPrompt, getChatUserPrompt } from "Routes/V1/AI/prompts/chat";
import { eq } from "drizzle-orm";
import winston from "winston";

export class ChatStreamHandler {
    private openai: OpenAI;
    boardClients = new Map<string, WebSocket.WebSocket[]>();

    constructor(openai: OpenAI) {
        this.openai = openai;
    }

    async handleUserRequest(options: {
        msg: AiChatMsg<UserRequest>;
        ws: WebSocket;
        logger: winston.Logger;
        boardClients: Map<string, WebSocket.WebSocket[]>;
    }) {
        const { msg, ws, logger, boardClients } = options;
        this.boardClients = boardClients;
        logger.debug("Received user request:", msg);
        try {
            logger.debug("Ensuring chat existence...");
            const chat = await this.ensureChatExists(msg, logger);

            logger.debug("Fetching context strings, if any...");
            const contextStrings =
                msg.event.context.length > 0 ? await this.getContextStrings(msg.event.context, logger) : [];

            logger.debug("Processing board context...");
            const boardContextStrings = msg.event.boardContext || [];

            const combinedContext = [...contextStrings, ...boardContextStrings];

            const contextMessages: ChatCompletionMessageParam[] = [];

            if (combinedContext.length > 0) {
                logger.debug("Adding user prompt with combined context to context messages...");
                contextMessages.push({
                    role: "user",
                    content: getChatUserPrompt(
                        msg.event.idea,
                        contextStrings.join(", "),
                        boardContextStrings.join(", ")
                    ),
                });
            } else {
                logger.debug("Adding user idea to context messages...");
                contextMessages.push({
                    role: "system",
                    content: getChatSystemPrompt(),
                });
                await this.saveMessage(chat, "system", getChatSystemPrompt(), logger);
                contextMessages.push({
                    role: "user",
                    content: msg.event.idea,
                });
            }

            logger.debug("Saving user message to database...");
            await this.saveMessage(chat, "user", msg.event.idea, logger);

            logger.debug("Generating chat completion stream...");
            const stream = await this.openai.generateStreamChatCompletion(contextMessages, {
                model: msg.event.model || "gpt-3.5-turbo",
            });

            if (!stream) {
                console.error("Failed to create stream");
                this.sendErrorResponse(chat, ws, "Failed to create stream");
                return;
            }

            logger.debug("Handling stream chunks...");
            this.handleStreamChunks(stream, ws, chat, logger);
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

    private async ensureChatExists(msg: AiChatMsg<UserRequest>, logger: winston.Logger): Promise<Chat> {
        logger.debug("Board ID provided, fetching existing chat...");
        let [boardChat] = await db.select().from(chat).where(eq(chat.boardId, msg.boardId)).limit(1);
        if (!boardChat) {
<<<<<<< Updated upstream
            const [newChat] = await db.insert(chat).values({ boardId: msg.boardId }).returning();

            return newChat;
=======
            [boardChat] = await db.insert(chat).values({ boardId: msg.boardId }).returning();
>>>>>>> Stashed changes
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
                    role: msg.role as "user" | "assistant" | "system",
                    content: msg.content,
                }))
            );
        }

        logger.debug("Adding user idea to context messages...");
        contextMessages.push({
            role: "user",
            content: event.idea,
        });

        logger.debug("Prepared context messages:", contextMessages);
        return contextMessages;
    }

    private handleStreamChunks(
        stream: Stream<ChatCompletionChunk> & {
            _request_id?: string | null;
        },
        ws: WebSocket,
        chat: Chat,
        logger: winston.Logger
    ) {
        logger.debug("Starting to handle stream chunks...");
        let assistantResponse = "";
        let usageMetadata: CompletionUsage | undefined;

        const readableStream = stream.toReadableStream();

        readableStream.pipeTo(
            new WritableStream({
                write: (chunk: Uint8Array) => {
                    try {
                        // Decode the Uint8Array to string and parse it as JSON
                        const decodedChunk = new TextDecoder().decode(chunk);
                        const parsedChunk: ChatCompletionChunk = JSON.parse(decodedChunk);

                        // logger.debug("Received stream chunk:", parsedChunk);

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
                                },
                            };
                            logger.debug("Sending chunk to WebSocket:", streamChunkMsg);
                            this.broadcastChunkToBoardClients(this.boardClients, chat.boardId, streamChunkMsg);
                            ws.send(JSON.stringify(streamChunkMsg));
                        }
                    } catch (error) {
                        console.error("Error processing stream chunk:", error);
                        this.sendErrorResponse(chat, ws, "Invalid chunk format");
                    }
                },
                close: () => {
                    logger.debug("Stream closed. Finalizing response...");
                    this.finalizeStream(ws, chat, assistantResponse, logger, usageMetadata);
                },
                abort: (err) => {
                    console.error("Streaming error:", err);
                    this.sendErrorResponse(chat, ws, err instanceof Error ? err.message : "Stream error");
                },
            })
        );
    }

    private async finalizeStream(
        ws: WebSocket,
        chat: Chat,
        assistantResponse: string,
        logger: winston.Logger,
        usageMetadata?: CompletionUsage
    ) {
        logger.debug("Finalizing stream response...");
        logger.debug("Saving assistant response to database...");
        await this.saveMessage(chat, "assistant", assistantResponse, logger, usageMetadata?.completion_tokens || 0);

        const endChunk: AiChatMsg<ChatChunk> = {
            type: "AiChat",
            boardId: chat.boardId,
            event: {
                method: "ChatChunk",
                type: "end",
                usage: usageMetadata,
                chatId: chat.id,
            },
        };

        logger.debug("Sending end chunk to WebSocket:", endChunk);
        this.broadcastChunkToBoardClients(this.boardClients, chat.boardId, endChunk);
        // ws.send(JSON.stringify(endChunk));
    }

    private async saveMessage(
        chat: Chat,
        role: "user" | "assistant" | "system",
        content: string,
        logger: winston.Logger,
        tokensUsed = 0
    ) {
        logger.debug("Saving message to database:", { chatId: chat.id, role, content, tokensUsed });
        await db.insert(message).values({
            chatId: chat.id,
            role,
            content,
            tokensUsed,
        });
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
