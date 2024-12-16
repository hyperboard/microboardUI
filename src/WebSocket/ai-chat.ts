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
}) => {
    const { msg, ws, openai, logger, boardClients } = options;
    const chatStreamHandler = new ChatStreamHandler(openai);

    switch (msg.event.method) {
        case "UserRequest":
            chatStreamHandler.handleUserRequest({ msg: msg as AiChatMsg<UserRequest>, ws, logger, boardClients });
            break;
        default:
            throw new Error("Unknown method");
    }
};

export type AiChatEventType = UserRequest;

// To receive
export interface UserRequest {
    method: "UserRequest";
    context: number[]; // chat message context;
    boardContext: string[];
    idea: string;
    model?: OpenAIModels; // default gpt-4-turbo-preview
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
