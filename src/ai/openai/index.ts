import LLM from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat";

export type OpenAIModels =
    | "davinci-002"
    | "babbage-002"
    | "text-davinci-003"
    | "text-davinci-002"
    | "text-davinci-001"
    | "text-curie-001"
    | "text-babbage-001"
    | "text-ada-001"
    | "davinci"
    | "curie"
    | "babbage"
    | "ada"
    | "code-davinci-002"
    | "code-davinci-001"
    | "code-cushman-002"
    | "code-cushman-001"
    | "davinci-codex"
    | "cushman-codex"
    | "text-davinci-edit-001"
    | "code-davinci-edit-001"
    | "text-embedding-ada-002"
    | "text-similarity-davinci-001"
    | "text-similarity-curie-001"
    | "text-similarity-babbage-001"
    | "text-similarity-ada-001"
    | "text-search-davinci-doc-001"
    | "text-search-curie-doc-001"
    | "text-search-babbage-doc-001"
    | "text-search-ada-doc-001"
    | "code-search-babbage-code-001"
    | "code-search-ada-code-001"
    | "gpt2"
    | "gpt-3.5-turbo"
    | "gpt-35-turbo"
    | "gpt-3.5-turbo-0301"
    | "gpt-3.5-turbo-0613"
    | "gpt-3.5-turbo-1106"
    | "gpt-3.5-turbo-0125"
    | "gpt-3.5-turbo-16k"
    | "gpt-3.5-turbo-16k-0613"
    | "gpt-3.5-turbo-instruct"
    | "gpt-3.5-turbo-instruct-0914"
    | "gpt-4"
    | "gpt-4-0314"
    | "gpt-4-0613"
    | "gpt-4-32k"
    | "gpt-4-32k-0314"
    | "gpt-4-32k-0613"
    | "gpt-4-turbo"
    | "gpt-4-turbo-2024-04-09"
    | "gpt-4-turbo-preview"
    | "gpt-4-1106-preview"
    | "gpt-4-0125-preview"
    | "gpt-4-vision-preview"
    | "gpt-4o"
    | "gpt-4o-2024-05-13"
    | "gpt-4o-2024-08-06"
    | "gpt-4o-mini-2024-07-18"
    | "gpt-4o-mini"
    | "o1-mini"
    | "o1-preview"
    | "o1-preview-2024-09-12"
    | "o1-mini-2024-09-12"
    | "chatgpt-4o-latest"
    | "gpt-4o-realtime"
    | "gpt-4o-realtime-preview-2024-10-01"
    | "tts-1";

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
    private client: LLM;
    private deepseek: LLM | null = null;
    private defaultModel: OpenAIModels = "gpt-4o";
    private defaultMaxTokens = 10000; // max 128k per completion for gpt-4o

    constructor(apiKey: string, options: { deepseekApiKey?: string } = {}) {
        const { deepseekApiKey } = options;

        this.client = new LLM({
            apiKey,
            baseURL: "https://openai-api.microboard.io/v1",
        });

        if (deepseekApiKey) {
            this.deepseek = new LLM({
                apiKey: deepseekApiKey,
                baseURL: "https://api.deepseek.com",
            });
        }
    }

    async generateChatCompletion(
        messages: ChatCompletionMessageParam[],
        options: {
            model?: OpenAIModels;
            temperature?: number;
            maxTokens?: number;
            customModel?: "deepseek-chat" | "deepseek-reasoner";
        } = {}
    ): Promise<string | null> {
        const {
            model = this.defaultModel,
            temperature = 0.7,
            maxTokens = this.defaultMaxTokens,
            customModel,
        } = options;

        try {
            let response = null;

            if (customModel && this.deepseek && customModel.startsWith("deepseek-")) {
                response = await this.deepseek.chat.completions.create({
                    model: customModel,
                    messages,
                    temperature,
                });
            } else {
                response = await this.client.chat.completions.create({
                    model,
                    messages,
                    temperature,
                    // max_completion_tokens: 4096,
                });
            }

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
            customModel?: "deepseek-chat" | "deepseek-reasoner";
        } = {}
    ) {
        const { model = this.defaultModel, temperature = 0.7, maxTokens = this.defaultMaxTokens, signal } = options;

        try {
            let response = null;

            if (options?.customModel && options.customModel.startsWith("deepseek-") && this.deepseek) {
                response = await this.deepseek.chat.completions.create(
                    {
                        model: options.customModel,
                        messages,
                        temperature,
                        stream: true,
                    },
                    { signal }
                );
            } else {
                response = await this.client.chat.completions.create(
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
            }

            return response;
        } catch (err) {
            console.log("Server openai error", err);
            return null;
        }
    }

    async generateImage(
        prompt: string,
        options: {
            size?: "256x256" | "512x512" | "1024x1024" | "1792x1024";
            quality?: "standard" | "hd";
        } = {}
    ): Promise<string> {
        const { size = "1024x1024", quality = "standard" } = options;

        const response = await this.client.images.generate({
            prompt,
            size,
            quality,
            n: 1,
            response_format: "b64_json",
        });

        return response.data[0]?.b64_json!;
    }

    async createEmbedding(input: string): Promise<number[] | null> {
        try {
            const response = await this.client.embeddings.create({
                model: "text-embedding-ada-002",
                input: input,
            });

            if (response.data.length > 0) {
                return response.data[0].embedding;
            } else {
                console.error("No embedding returned.");
                return null;
            }
        } catch (error) {
            console.error("Error creating embedding:", error);
            return null;
        }
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

        return this.client.audio.transcriptions.create({
            file,
            model: "whisper-1",
            language,
            prompt,
            response_format: responseFormat,
        });
    }

    async moderateContent(input: string | string[]) {
        return this.client.moderations.create({
            input,
        });
    }
}
