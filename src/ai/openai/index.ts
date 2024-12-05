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
    | "o1-mini";

export class OpenAI {
    private client: llm;
    private defaultModel = "gpt-4-turbo-preview";
    private defaultMaxTokens = 10000; // max 128k per completion for gpt-4o

    constructor(apiKey: string) {
        this.client = new llm({
            apiKey: process.env.AIMLAPI_KEY,
            baseURL: "https://api.aimlapi.com/v1",
        });
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
                max_completion_tokens: 4096,
            });

            return response.choices[0].message.content;
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
