import { eq } from "drizzle-orm";
import { files } from "../../../drizzle/entities/files";
import winston from "winston";
import { OpenAI } from "../../../ai/openai";
import { db } from "../../../drizzle/db";

interface FileEmbeddingService {
    client: OpenAI;
    logger: winston.Logger;
}

export class FileEmbeddingHandler {
    private client: OpenAI;
    private logger: winston.Logger;

    constructor({ client, logger }: FileEmbeddingService) {
        this.client = client;
        this.logger = logger;
    }

    async processFileAndCreateEmbedding(fileId: number, fileContent: string, boardId: string) {
        try {
            const embedding = await this.generateEmbedding(fileContent);

            if (!embedding) {
                throw new Error("Failed to generate embedding");
            }

            await this.updateFileEmbedding(fileId, embedding, boardId);

            return { success: true, fileId };
        } catch (error) {
            this.logger.error(`Error processing file ${fileId}: ${(error as Error).message}`);
            throw new Error(`Failed to process file and create embedding: ${(error as Error).message}`);
        }
    }

    private async generateEmbedding(content: string) {
        try {
            return await this.client.createEmbedding(content);
        } catch (error) {
            this.logger.error(`Error generating embedding: ${(error as Error).message}`);
            throw new Error(`Failed to generate embedding: ${(error as Error).message}`);
        }
    }

    private async updateFileEmbedding(fileId: number, embedding: number[], boardId: string) {
        try {
            await db
                .update(files)
                .set({
                    embedding,
                    boardId,
                })
                .where(eq(files.id, fileId));
        } catch (error) {
            this.logger.error(`Error updating file ${fileId} with embedding: ${(error as Error).message}`);
            throw new Error(`Failed to update file with embedding: ${(error as Error).message}`);
        }
    }

    async reprocessAllFileEmbeddings(boardId?: string) {
        try {
            const query = boardId ? db.select().from(files).where(eq(files.boardId, boardId)) : db.select().from(files);

            const allFiles = await query;

            for (const file of allFiles) {
                const fileContent = await this.getFileContent(file.link);
                await this.processFileAndCreateEmbedding(file.id, fileContent, file.boardId!);
            }

            return { success: true, processedCount: allFiles.length };
        } catch (error) {
            this.logger.error(`Error reprocessing file embeddings: ${(error as Error).message}`);
            throw new Error(`Failed to reprocess file embeddings: ${(error as Error).message}`);
        }
    }

    private async getFileContent(fileLink: string): Promise<string> {
        throw new Error("Method not implemented");
    }
}
