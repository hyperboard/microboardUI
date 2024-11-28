import { OpenAI } from "ai/openai";
import { getFlowChartDotPrompt } from "./prompts/flow-chart";

export class AI {
    constructor(private openai: OpenAI) {}

    public async generateSimpleChart(input: string, withContext = false): Promise<string | null> {
        try {
            const response = await this.openai.generateChatCompletion(
                [
                    { role: "system", content: getFlowChartDotPrompt() },
                    { role: "user", content: input },
                ],
                {
                    model: "gpt-4o",
                    maxTokens: 4096,
                }
            );

            return response || null;
        } catch (error) {
            console.error("Failed to generate chart", error);
            return null;
        }
    }
}
