import { OpenAI } from "openai";
import fs from "fs";
import { SpeechCreateParams } from "openai/resources/audio/speech";
import { HttpException } from "shared/exceptions/http-exception";
import { HttpStatus } from "shared/enums/http-status.enum";

export interface GenerateAudioOptions {
    openaiToken: string;
    text: string;
    model: "tts-1-hd";
    voice?: string;
    outputFormat?: string;
}

export interface GenerateAudioResult {
    base64: string;
    audioUrl: string | null;
}

export async function generateAudio(options: GenerateAudioOptions): Promise<GenerateAudioResult> {
    const openai = new OpenAI({
        apiKey: options.openaiToken,
    });

    const params: SpeechCreateParams = {
        model: options.model || "tts-1-hd",
        input: options.text,
        voice: "onyx",
        // voice: options.voice || "ash" as const,
    };

    const response = await openai.audio.speech.create(params);

    if (!response.ok) {
        const errorText = await response.text();
        throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, `TTS API error: ${response.status} - ${errorText}`);
    }

    const audioBuffer = await response.arrayBuffer();
    const audioBase64 = Buffer.from(audioBuffer).toString("base64");

    // const outputPath = `output.${options.outputFormat || "mp3"}`;
    // fs.writeFileSync(outputPath, Buffer.from(audioBuffer));

    return {
        base64: audioBase64,
        // audioUrl: `file://${outputPath}`,
        audioUrl: null,
    };
}
