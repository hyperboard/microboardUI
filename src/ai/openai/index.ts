import llm from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat";

export type OpenAIModels =
    | "gpt-3.5-turbo"
    | "gpt-4"
    | "gpt-4o"
    | "gpt-4o-mini"
    | "gpt-4-32k"
    | "gpt-3.5-turbo-0613"
    | "gpt-4-0613"
    | "gpt-3.5-turbo-16k"
    | "gpt-4-16k"
    | "o1-preview"
    | "o1-mini";

function forceMaxTokens(model: OpenAIModels): number {
    switch (model) {
        case "gpt-4":
        case "gpt-4o":
            return 16_384;
        case "gpt-4o-mini":
            return 16_384;
        case "o1-mini": // no streaming
            return 32_768;
        case "o1-preview": // no streaming
            return 64_536;
        default:
            return 4096;
    }
}

export class OpenAI {
    private client: llm;
    private defaultModel: OpenAIModels = "gpt-4o";
    private defaultMaxTokens = 10000; // max 128k per completion for gpt-4o

    constructor(apiKey: string) {
        if (process.env.OPENAI_ENABLED === "true") {
            this.client = new llm({
                apiKey,
            });
        } else {
            // AIMLAPI
            this.client = new llm({
                apiKey: process.env.AIMLAPI_KEY,
                baseURL: "https://api.aimlapi.com/v1",
            });
        }
    }

    async generateChatCompletion(
        messages: ChatCompletionMessageParam[],
        options: {
            model?: OpenAIModels;
            temperature?: number;
            maxTokens?: number;
        } = {}
    ): Promise<string | null> {
        const { model = this.defaultModel, temperature = 0.7, maxTokens = this.defaultMaxTokens } = options;

        try {
            const response = await this.client.chat.completions.create({
                model,
                messages,
                temperature,
                // max_completion_tokens: 4096,
            });

            return response.choices[0].message.content;
        } catch (err) {
            console.log("Server openai error", err);
            return null;
        }
    }

    async generateStreamChatCompletion(
        messages: ChatCompletionMessageParam[],
        options: {
            signal?: AbortSignal | undefined | null;
            model?: OpenAIModels;
            temperature?: number;
            maxTokens?: number;
        } = {}
    ) {
        const { model = this.defaultModel, temperature = 0.7, maxTokens = this.defaultMaxTokens, signal } = options;

        try {
            const response = await this.client.chat.completions.create(
                {
                    model,
                    messages,
                    temperature,
                    // max_completion_tokens: forceMaxTokens(model),
                    stream: true,
                },
                {
                    signal: signal,
                }
            );

            return response;
        } catch (err) {
            console.log("Server openai error", err);
            return null;
        }
    }

    async generateImage(
        prompt: string,
        options: {
            size?: "256x256" | "512x512" | "1024x1024";
            quality?: "standard" | "hd";
            n?: number;
        } = {}
    ) {
        const { size = "1024x1024", quality = "standard", n = 1 } = options;

        return await this.client.images.generate({
            prompt,
            size,
            quality,
            n,
        });
    }

    async createEmbedding(input: string | string[]) {
        return await this.client.embeddings.create({
            model: "text-embedding-ada-002",
            input,
        });
    }

    async transcribeAudio(
        file: File,
        options: {
            language?: string;
            prompt?: string;
            responseFormat?: "json" | "text" | "srt" | "verbose_json" | "vtt";
        } = {}
    ) {
        const { language, prompt, responseFormat = "text" } = options;

        return await this.client.audio.transcriptions.create({
            file,
            model: "whisper-1",
            language,
            prompt,
            response_format: responseFormat,
        });
    }

    async moderateContent(input: string | string[]) {
        return await this.client.moderations.create({
            input,
        });
    }
}
