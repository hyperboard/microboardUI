import winston from "winston";
import express from "express";
import { OpenAI } from "../../../ai/openai";
import { db } from "../../../drizzle/db";
import { files } from "../../../drizzle/entities/files";
import { catchAsync } from "../../../shared/lib/catchAsync";
import { body } from "express-validator";
import { BUCKET_NAME, minioClient } from "../Media/MinioClient";
import { HttpStatus } from "../../../shared/enums/http-status.enum";
import { pipeline } from "stream/promises";
import { FileEmbeddingHandler } from "./FileEmbeddingHandler";

export const getIngestRouter = (logger: winston.Logger, openai: OpenAI): express.Router => {
    const router = express.Router();
    const fileEmbeddingHandler = new FileEmbeddingHandler({
        logger: logger,
        client: openai,
    });

    router.post(
        "/ingest",
        body("boardId").isString(),
        body("id").isString(),
        catchAsync(async (req, res) => {
            if (!minioClient) {
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).send("No minio client");
            }
            const boardId = req.body.boardId as string;
            const id = req.body.id as string;

            const [newFile] = await db
                .insert(files)
                .values({
                    boardId,
                    link: id,
                })
                .returning();

            const savedMedia = await minioClient!.getObject(BUCKET_NAME, id);
            console.log("saved media", savedMedia);
            const chunks: Buffer[] = [];
            await pipeline(savedMedia, async function* (source) {
                for await (const chunk of source) {
                    chunks.push(Buffer.from(chunk));
                }
            });
            console.log("chunks: ", chunks);
            const mediaString = Buffer.concat(chunks).toString("utf-8");
            await fileEmbeddingHandler.processFileAndCreateEmbedding(newFile.id, mediaString, boardId);

            res.send("Created");
        })
    );

    return router;
};
