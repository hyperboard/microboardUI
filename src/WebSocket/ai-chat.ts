import { DallEOptions, FluxOptions, GenerateImageOptions, ImageGenerator, MidjourneyOptions } from "../ai/openai/image-generator";
import { OpenAI, OpenAIModels } from "ai/openai";
import { ChatStreamHandler } from "ai/openai/ChatStreamHandler";
import { Message } from "drizzle/entities";
import { CompletionUsage } from "openai/resources";
import winston from "winston";
import WebSocket from "ws";
export function getAIChatMsgHandler(options: {
    openai: OpenAI;
    imageGenerator: ImageGenerator;
    logger: winston.Logger;
    boardClients: Map<string, WebSocket.WebSocket[]>;
    chatStreamHandler: ChatStreamHandler;
}): (msg: AiChatMsg, ws: WebSocket) => Promise<void> {
    return async (msg: AiChatMsg, ws: WebSocket) => {
        const { logger, chatStreamHandler, imageGenerator } = options;

        switch (msg.event.method) {
            case "UserRequest":
                chatStreamHandler.handleUserRequest({
                    msg: msg as AiChatMsg<UserRequest>,
                    ws,
                });
                break;
            case "GenerateImage":
                chatStreamHandler.handleGenerateImage(
                    msg as AiChatMsg<GenerateImageEvent>,
                    imageGenerator,
                    ws,
                );
                break;
            case "GenerateAudio":
                chatStreamHandler.handleGenerateAudio(
                    msg as AiChatMsg<GenerateAudioEvent>,
                    ws,
                );
                break;
            case "StopGeneration":
                chatStreamHandler.stopConversation({
                    msg: msg as AiChatMsg<StopGeneration>,
                    boardId: msg.boardId,
                    ws,
                    itemId: msg.event.itemId,
                });
                break;
            case "GetMessageList":
                chatStreamHandler.handleGetMessageList({
                    msg: msg as AiChatMsg<GetMessageList>,
                    ws,
                });
                break;

            default:
                throw new Error("Unknown method");
        }
    };
}

export type AiChatEventType = UserRequest | StopGeneration | GetMessageList | GenerateImageEvent | GenerateAudioEvent;

// To receive
export interface UserRequest {
    method: "UserRequest";
    context: string[]; // chat message context;
    boardContext: string[];
    boardContextIds?: string[]; // just for frontend
    idea: string;
    model?: OpenAIModels; // default gpt-4-turbo-preview
    images?: string[]; // only with 4o and later. Image link or base64. Better use: `data:{type};base64,${base64}`
    updatedFrom?: number; // "user" message id
    itemId: string; // response item id;
    requestItemId: string;
    action?: TextAction;
    contextRequest?: {
        messageId: string; // redefine context
        range?: number;
    };
    createThreadFrom?: string;
}

export type TTextAction = "adjust_text_length" | "adjust_reading_level" | "adjust_emojis";
/*
Levels:
-3 to 3 for text adjustment
0 to 6 for reading level adjustment
0 to 3 for emojis
* */

export interface TextAction {
    messageId: string;
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

export interface GenerateImageEvent {
    method: "GenerateImage";
    prompt: string;
    itemId: string;
    options: GenerateImageOptions;
}

export interface GenerateImageResponse {
    method: "GenerateImage";
    status: "generating" | "completed" | "error";
    message?: string;
    base64: string | null;
    imageUrl: string | null;
    itemId: string;
}
/*
DALL·E 3	Standard	1024×1024	$0.040 / image
            Standard	1024×1792, 1792×1024	$0.080 / image

DALL·E 3	HD	1024×1024	$0.080 / image
            HD	1024×1792, 1792×1024	$0.120 / image

DALL·E 2		1024×1024	$0.020 / image
                512×512	$0.018 / image
                256×256	$0.016 / image
 */

export interface GenerateAudioEvent {
    method: "GenerateAudio";
    text: string;
    model: "tts-1-hd";
}

export interface GenerateAudioResponse {
    method: "GenerateAudio";
    status: "generating" | "completed" | "error";
    base64: string | null;
    audioUrl: string | null;
    message?: string;
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
    userMessage?: number | null;
    assistantMessage?: number | null;
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
