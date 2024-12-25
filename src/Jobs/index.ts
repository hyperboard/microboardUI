import { OpenAI } from "ai/openai";
import { Job, Worker } from "bullmq";
import { db } from "drizzle/db";
import { files } from "drizzle/entities/files";
import { Redis } from "Redis";
import { FileEmbeddingHandler } from "Routes/V1/Ingest/FileEmbeddingHandler";
import { BUCKET_NAME, minioClient } from "Routes/V1/Media/MinioClient";
import { pipeline } from "stream/promises";
import winston from "winston";

export type TWorker = "ingest";

async function initBullMQ(options: { redis: Redis; logger: winston.Logger; openai: OpenAI }) {
    await initIngestWorker({ ...options });
}

interface IngestJob {
    id: string;
    boardId: string;
}

async function initIngestWorker(options: { redis: Redis; logger: winston.Logger; openai: OpenAI }) {
    const { redis, logger, openai } = options;
    const fileEmbeddingHandler = new FileEmbeddingHandler({
        logger: logger,
        client: openai,
    });

    const ingestWorker = new Worker(
        "ingest",
        async (job: Job<IngestJob>) => {
            console.log(job.data);
            const { id, boardId } = job.data;

            const [newFile] = await db
                .insert(files)
                .values({
                    boardId,
                    link: id,
                })
                .returning();

            const savedMedia = await minioClient!.getObject(BUCKET_NAME, id);
            console.log("saved media");
            const chunks: Buffer[] = [];
            await pipeline(savedMedia, async function* (source) {
                for await (const chunk of source) {
                    chunks.push(Buffer.from(chunk));
                }
            });
            console.log("chunks");
            const mediaString = Buffer.concat(chunks).toString("utf-8");
            // TODO: Rewrite from openai to another embedding service
            await fileEmbeddingHandler.processFileAndCreateEmbedding(newFile.id, mediaString, boardId);

            return { success: true, fileId: newFile.id };
        },
        {
            connection: redis.client,
        }
    );

    ingestWorker.on("completed", () => {
        console.log("ingest completed");
    });
}
