import { OpenAI, OpenAIModels } from "ai/openai";
import { ChatStreamHandler } from "ai/openai/ChatStreamHandler";
import { Message } from "drizzle/entities";
import { CompletionUsage } from "openai/resources";
import winston from "winston";
import WebSocket from "ws";
export const handleAIChatMessage = async (options: {
    msg: AiChatMsg;
    ws: WebSocket;
    openai: OpenAI;
    logger: winston.Logger;
    boardClients: Map<string, WebSocket.WebSocket[]>;
    chatStreamHandler: ChatStreamHandler;
}) => {
    const { msg, ws, logger, boardClients, chatStreamHandler } = options;

    switch (msg.event.method) {
        case "UserRequest":
            await chatStreamHandler.handleUserRequest({ msg: msg as AiChatMsg<UserRequest>, ws, logger, boardClients });
            break;
        case "StopGeneration":
            await chatStreamHandler.stopConversation({
                msg: msg as AiChatMsg<StopGeneration>,
                boardId: msg.boardId,
                ws,
                logger,
                itemId: msg.event.itemId,
            });
            break;
        case "GetMessageList":
            await chatStreamHandler.handleGetMessageList({
                msg: msg as AiChatMsg<GetMessageList>,
                logger,
                boardClients,
            });
            break;

        default:
            throw new Error("Unknown method");
    }
};

export type AiChatEventType = UserRequest | StopGeneration | GetMessageList;

// To receive
export interface UserRequest {
    method: "UserRequest";
    context: number[]; // chat message context;
    boardContext: string[];
    boardContextIds?: string[]; // just for frontend
    idea: string;
    model?: OpenAIModels; // default gpt-4-turbo-preview
    images?: string[]; // only with 4o and later. Image link or base64. Better use: `data:{type};base64,${base64}`
    updatedFrom?: number; // "user" message id
    itemId: string; // response item id;
    requestItemId: string;
    action?: TextAction;
}

export type TTextAction = "adjust_text_length" | "adjust_reading_level" | "adjust_emojis";
/*
Levels:
-3 to 3 for text adjustment
0 to 6 for reading level adjustment
0 to 3 for emojis
* */

export interface TextAction {
    action: TTextAction;
    level: number;
}

export interface StopGeneration {
    method: "StopGeneration";
    itemId: string;
}

export interface GetMessageList {
    method: "GetMessageList";
    boardId: string;
}

// To send
export interface ChatChunk {
    method: "ChatChunk";
    chatId: number;
    type: "chunk" | "done" | "end" | "error";
    itemId: string;
    content?: string;
    usage?: Partial<CompletionUsage>;
    error?: string;
    message?: number;
}

export interface MessageList {
    method: "MessageList";
    messages: Message[];
}

export interface AiChatMsg<T = AiChatEventType> {
    type: "AiChat";
    boardId: string; // uuid
    event: T;
}
