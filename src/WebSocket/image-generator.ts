import OpenAI from "openai";
import Replicate from "replicate";
import winston from "winston";

interface GenerateImageResult {
    imageUrl: string | null;
    base64: string | null;
}

interface MidjourneyOptions {
    model: "midjourney";
    prompt: string;
}

interface DallEOptions {
    model: "dall-e-2" | "dall-e-3";
    prompt: string;
    quality?: "standard" | "hd";
    size?: "256x256" | "512x512" | "1024x1024" | "1024x1792" | "1792x1024";
}

interface FluxOptions {
    model: "flux-schnell" | "flux-pro";
    prompt: string;
    aspectRatio: string;
}

interface RecraftOptions {
    model: "recraft";
    prompt: string;
}

export type GenerateImageOptions = MidjourneyOptions | DallEOptions | FluxOptions | RecraftOptions;

interface JobStatus {
    imageURL?: string;
    error?: string;
    status?: string;
    content?: unknown;
    success: boolean;
}

interface Imagine {
    jobid: string;
    verb: string;
    status: string;
    created: string;
    updated: string;
    prompt: string;
    discord: string;
    channel: string;
    server: string;
    maxJobs: number;
    replyUrl: string;
    replyRef?: string;
    messageId: string;
    content: string;
    timestamp: string;
    code: number;
}

export interface ImageGenerator {
    generateImage: (options: GenerateImageOptions) => Promise<GenerateImageResult>;
}

export const createImageGenerator = (generatorOptions: {
    openaiToken: string;
    replicateToken: string;
    recraftToken?: string;
    useapiToken?: string;
    discordToken?: string;
    discordServerId?: string;
    discordChannelId?: string;
    logger: winston.Logger;
}): ImageGenerator => {
    const replicate = new Replicate({
        auth: generatorOptions.replicateToken,
    });

    const { logger } = generatorOptions;

    const inProgress = ["created", "started", "progress"];
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    async function checkMidjourneyJobStatus(jobid: string, headers: { Authorization: string }): Promise<JobStatus> {
        const apiUrl = `https://api.useapi.net/v2/jobs/?jobid=${jobid}`;

        try {
            const res = await fetch(apiUrl, { headers });

            if (res.ok) {
                const json = await res.json();
                const { status } = json;

                if (status === "completed") {
                    const { attachments = [] } = json;
                    const imageURL = attachments[0]?.url;

                    return { imageURL: imageURL || "URL not found", success: true };
                } else if (inProgress.includes(status)) {
                    await sleep(1000);
                    return checkMidjourneyJobStatus(jobid, headers);
                }

                logger.debug("Unknown status or error occurred");
                return {
                    success: false,
                    error: "Unknown status or error occurred",
                };
            }

            logger.debug(`Failed to check job status, HTTP status: ${res.status}`);
            return {
                success: false,
                error: `Failed to check job status, HTTP status: ${res.status}`,
            };
        } catch (e) {
            logger.debug(`error checking job status: ${e}`);
            return { success: false, error: `error checking job status: ${e}` };
        }
    }

    async function midjourney(options: MidjourneyOptions): Promise<GenerateImageResult> {
        if (!generatorOptions.useapiToken) {
            throw new Error("USEAPI_TOKEN is required for Midjourney");
        }
        if (!generatorOptions.discordToken) {
            throw new Error("DISCORD_TOKEN is required for Midjourney");
        }
        if (!generatorOptions.discordServerId) {
            throw new Error("DISCORD_SERVER_ID is required for Midjourney");
        }
        if (!generatorOptions.discordChannelId) {
            throw new Error("DISCORD_CHANNEL_ID is required for Midjourney");
        }

        const headers = { Authorization: `Bearer ${generatorOptions.useapiToken}` };
        const apiUrl = "https://api.useapi.net/v2/jobs/imagine";

        try {
            const data = new URLSearchParams({
                prompt: options.prompt,
                discord: generatorOptions.discordToken,
                server: generatorOptions.discordServerId,
                channel: generatorOptions.discordChannelId,
            });

            const res = await fetch(apiUrl, {
                method: "POST",
                body: data,
                headers,
            });

            if (!res.ok) {
                throw new Error(`Failed to start image generation task. Response: ${await res.text()}`);
            }

            const { jobid } = await res.json();
            if (!jobid) {
                throw new Error("No job ID received");
            }

            const status = await checkMidjourneyJobStatus(jobid, headers);
            if (!status.success || !status.imageURL) {
                throw new Error(status.error || "Failed to generate image");
            }

            return { imageUrl: status.imageURL, base64: null };
        } catch (e: any) {
            throw new Error(`Midjourney error: ${e?.message}`);
        }
    }

    async function dallE(options: DallEOptions): Promise<GenerateImageResult> {
        const openai = new OpenAI({
            apiKey: generatorOptions.openaiToken,
            baseURL: "https://openai-api.microboard.io/v1",
        });

        const { size = "1024x1024", quality = "standard" } = options;

        const response = await openai.images.generate({
            prompt: options.prompt,
            size,
            quality,
            n: 1,
            response_format: "b64_json",
        });

        return { base64: response.data[0]?.b64_json!, imageUrl: null };
    }

    async function flux(options: FluxOptions): Promise<GenerateImageResult> {
        try {
            if (!options?.model) {
                throw new Error("Model parameter is required");
            }
            if (!options?.prompt) {
                throw new Error("Prompt parameter is required");
            }

            const response = await replicate.run(`black-forest-labs/${options.model}`, {
                input: {
                    prompt: options.prompt,
                    aspect_ratio: options.aspectRatio || "1:1",
                },
            });

            if (response && Array.isArray(response) && response[0] instanceof ReadableStream) {
                const stream = response[0];
                const reader = stream.getReader();
                const chunks: Uint8Array[] = [];

                try {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;

                        if (value instanceof Uint8Array) {
                            chunks.push(value);
                        } else {
                            console.warn("Unexpected chunk type:", typeof value);
                        }
                    }
                } finally {
                    reader.releaseLock();
                }

                if (chunks.length === 0) {
                    throw new Error("No data received from stream");
                }

                const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
                const combinedArray = new Uint8Array(totalLength);
                let offset = 0;

                for (const chunk of chunks) {
                    combinedArray.set(chunk, offset);
                    offset += chunk.length;
                }

                const base64Image = Buffer.from(combinedArray).toString("base64");

                const contentType = "image/png";

                return {
                    imageUrl: null,
                    base64: `data:${contentType};base64,${base64Image}`,
                };
            }

            throw new Error("Unexpected response format from Replicate API");
        } catch (error) {
            console.error("Error in flux function:", error);

            let errorMessage = "Unknown error occurred";
            if (error instanceof TypeError) {
                errorMessage = "Network or parsing error";
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }

            throw new Error(`Flux generation failed: ${errorMessage}`);
        }
    }

    async function recraft(options: RecraftOptions): Promise<GenerateImageResult> {
        throw new Error("Not implemented");
        return { imageUrl: null, base64: null };
    }

    async function generateImage(options: GenerateImageOptions): Promise<GenerateImageResult> {
        switch (options.model) {
            case "midjourney":
                return midjourney(options);
            case "dall-e-2":
            case "dall-e-3":
                return dallE(options);
            case "flux-schnell":
            case "flux-pro":
                return flux(options);
            case "recraft":
                return recraft(options);
            default:
                throw new Error(`Unsupported model or wrong parameters`);
        }
    }

    return {
        generateImage,
    };
};
