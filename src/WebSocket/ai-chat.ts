import { OpenAI, OpenAIModels } from "ai/openai";
import { ChatStreamHandler } from "ai/openai/ChatStreamHandler";
import { CompletionUsage } from "openai/resources";
import winston from "winston";
import WebSocket from "ws";
export const handleAIChatMessage = (options: {
    msg: AiChatMsg;
    ws: WebSocket;
    openai: OpenAI;
    logger: winston.Logger;
    boardClients: Map<string, WebSocket.WebSocket[]>;
    chatStreamHandler: ChatStreamHandler;
}) => {
    const { msg, ws, openai, logger, boardClients, chatStreamHandler } = options;

    switch (msg.event.method) {
        case "UserRequest":
            chatStreamHandler.handleUserRequest({ msg: msg as AiChatMsg<UserRequest>, ws, logger, boardClients });
            break;
        case "StopGeneration":
            chatStreamHandler.stopConversation({
                msg: msg as AiChatMsg<StopGeneration>,
                boardId: msg.boardId,
                ws,
                logger,
                itemId: msg.event.itemId,
            });
            break;

        default:
            throw new Error("Unknown method");
    }
};

export type AiChatEventType = UserRequest | StopGeneration;

// To receive
export interface UserRequest {
    method: "UserRequest";
    context: number[]; // chat message context;
    boardContext: string[];
    idea: string;
    model?: OpenAIModels; // default gpt-4-turbo-preview
    updatedFrom?: number; // "user" message id
    itemId: string;
}

export interface StopGeneration {
    method: "StopGeneration";
    itemId: string;
}

// To send
export interface ChatChunk {
    method: "ChatChunk";
    chatId: number;
    type: "chunk" | "done" | "end" | "error";
    itemId: string;
    content?: string;
    usage?: CompletionUsage;
    error?: string;
}

export interface AiChatMsg<T = AiChatEventType> {
    type: "AiChat";
    boardId: string; // uuid
    event: T;
}
