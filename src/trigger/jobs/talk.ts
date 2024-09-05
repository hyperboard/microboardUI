import { invokeTrigger, IO } from "@trigger.dev/sdk";
import { getDatabase } from "Database";
import { Boards } from "Routes/V1/Boards";
import { s3 } from "s3";
import { client } from "trigger";
import { getTransformedBoard } from "trigger/etl/parsers";
import { processImageItem } from "trigger/etl/utils";
import { v4 } from "uuid";
import { createLogger } from "winston";
import { z } from "zod";

const TALK_BUCKET_NAME = process.env.TALK_BUCKET_NAME || "talk";
const HEARTBEAT_INTERVAL = 15000;
const storageUrl = process.env.STORAGE_URL || "http://localhost:8001/api/v1/media";

interface S3Board {
    board: string | null;
    items: string[];
    connectors: string[];
    metaInfo: string | null;
    images: string[];
}

function spitBoardFiles(filePaths: string[]): S3Board {
    try {
        const boardData: S3Board = {
            board: null,
            metaInfo: null,
            items: [],
            connectors: [],
            images: [],
        };

        filePaths.forEach((filePath) => {
            if (filePath.includes("board.json")) {
                boardData.board = filePath;
            } else if (filePath.includes("items")) {
                boardData.items.push(filePath);
            } else if (filePath.includes("connectors")) {
                boardData.connectors.push(filePath);
            } else if (filePath.includes("meta-info.json")) {
                boardData.metaInfo = filePath;
            } else if (filePath.includes("/images/")) {
                boardData.images.push(filePath);
            }
        });

        return boardData;
    } catch (e) {
        throw new Error("Error parsing board files: " + e);
    }
}

async function setLastActivity(taskId: string, io: IO) {
    const now = Date.now();
    try {
        const taskJson = await s3.getJson(TALK_BUCKET_NAME, `tasks/exported/${taskId}.json`);
        await s3.updateJsonFile(TALK_BUCKET_NAME, `tasks/exported/${taskId}.json`, {
            ...taskJson,
            lastActivityTime: now,
        });
        await io.logger.log(`Last activity updated ${now}}`, { now });
    } catch (e) {
        await io.logger.error(`Error updating last activity ${now}}`, { e });
    }
}

export const talkIntegrationJob = client.defineJob({
    id: "talk-integration",
    name: "Talk Integration",
    version: "0.0.1",
    trigger: invokeTrigger({
        schema: z.object({
            id: z.string(),
            userId: z.string(),
        }),
    }),
    run: async (payload, io, ctx) => {
        const heartbeat = setInterval(async () => {
            await setLastActivity(payload.id, io);
        }, HEARTBEAT_INTERVAL);
        await setLastActivity(payload.id, io);

        try {
            const winstonLogger = createLogger();
            const database = await getDatabase(winstonLogger);
            const newBoardId = v4();

            const taskJson = await io.runTask(
                "Get JSON File",
                async () => await s3.getJson(TALK_BUCKET_NAME, `tasks/exported/${payload.id}.json`)
            );

            await io.logger.info("Importing board from Talk", {
                jsonFile: taskJson,
            });
            const workerID = taskJson?.WorkerName;
            if (!workerID) {
                throw new Error("Worker ID not found");
            }

            const boardFiles = await io.runTask(
                "List Files",
                async () => await s3.listAllFiles(TALK_BUCKET_NAME, `${workerID}/${payload.id}`)
            );
            await io.logger.info("Files found", {
                files: boardFiles,
            });

            const boardData = spitBoardFiles(boardFiles);
            await io.logger.info("Board data", {
                boardData,
            });

            if (!boardData.board) {
                throw new Error("Board not found");
            }

            const board = await io.runTask(
                "Get Board",
                async () => await s3.getJson(TALK_BUCKET_NAME, boardData.board!)
            );

            await io.logger.info(`S3 Board fetched: ${boardData.board}`, {
                board,
            });

            const fetchItemsFromS3 = async () => {
                let items: any[] = [];
                let imageProcessingPromises: Promise<void>[] = [];

                for (const itemFilePath of boardData.items) {
                    const itemData = await s3.getJson(TALK_BUCKET_NAME, itemFilePath);

                    await io.logger.info(`Item fetched: ${itemFilePath}`, {
                        itemData,
                    });

                    for (const data of itemData?.data || []) {
                        if (data.type === "image") {
                            const imageJsonPath = boardData.images.find((image) => image.includes(data.id));
                            const processImagePromise = (async () => {
                                try {
                                    const imageJson = await s3.getJson(TALK_BUCKET_NAME, imageJsonPath!);
                                    const hash = imageJson.FilePath;
                                    const copiedImage = { ...data };

                                    copiedImage.data.imageUrl = `${storageUrl}${hash}`;
                                    await io.logger.log(`Processed image: ${data.id}`, {
                                        image: copiedImage,
                                    });
                                    items.push({
                                        item: copiedImage,
                                        boardId: newBoardId,
                                        userId: payload.userId,
                                    });
                                } catch (e) {
                                    await io.logger.error(
                                        `Error processing image item: ${imageJsonPath}, skipping...`,
                                        {
                                            error: e,
                                        }
                                    );
                                }
                            })();
                            imageProcessingPromises.push(processImagePromise);
                        } else {
                            items.push({
                                item: data,
                                boardId: newBoardId,
                                userId: payload.userId,
                            });
                        }
                    }
                }

                await Promise.all(imageProcessingPromises);

                let connectors: any[] = [];
                for (const connectorFilePath of boardData.connectors) {
                    const connectorData = await s3.getJson(TALK_BUCKET_NAME, connectorFilePath);

                    await io.logger.info(`Connector fetched: ${connectorFilePath}`, {
                        connectorData,
                    });
                    (connectorData?.data as any[]).forEach((data) => {
                        connectors.push({
                            item: data,
                            boardId: newBoardId,
                            userId: payload.userId,
                        });
                    });
                }

                return {
                    items,
                    connectors,
                };
            };

            const { items, connectors } = await fetchItemsFromS3();

            const transformedBoard = getTransformedBoard({
                miroBoard: board,
                userId: payload.userId,
                items,
                connectors,
            });

            await io.logger.info(`Transformed board: `, {
                transformedBoard,
            });

            const boards = new Boards(database, winstonLogger);
            const createdBoardId = await boards.saveBoardData(transformedBoard);

            if (createdBoardId) {
                await io.logger.info(`import success: ${payload.id}`);
                await io.runTask(`Update JSON File: success ${payload.id}}`, async () => {
                    await s3.updateJsonFile(TALK_BUCKET_NAME, `tasks/exported/${payload.id}.json`, {
                        ...taskJson,
                        MicroBoardId: createdBoardId,
                    });
                    await s3.moveFile(
                        TALK_BUCKET_NAME,
                        `tasks/exported/${payload.id}.json`,
                        `tasks/imported/${payload.id}.json`
                    );
                });
            } else {
                await io.logger.info(`import failed: ${payload.id}`);
                throw new Error(`Save board to db error: ${payload.id}`);
            }
        } catch (error) {
            await io.logger.error(`Error in import job for board ${payload.id}:`, {
                error,
            });
            await io.runTask("Import error", async () => {
                const taskJson = await s3.getJson(TALK_BUCKET_NAME, `tasks/exported/${payload.id}.json`);
                await s3.updateJsonFile(TALK_BUCKET_NAME, `tasks/exported/${payload.id}.json`, {
                    ...taskJson,
                    "MetaInfo.errorMessage": JSON.stringify(error),
                });
                await s3.moveFile(
                    TALK_BUCKET_NAME,
                    `tasks/exported/${payload.id}.json`,
                    `tasks/import-error/${payload.id}.json`
                );
            });

            throw error;
        } finally {
            clearInterval(heartbeat);
        }
    },
});
