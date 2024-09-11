import { invokeTrigger, IO } from "@trigger.dev/sdk";
import { getDatabase } from "Database";
import { Boards } from "Routes/V1/Boards";
import { s3 } from "s3";
import { client } from "trigger";
import { getTransformedBoard } from "trigger/etl/parsers";
import { getSVGDimensionsFromURL, imageUrlToBase64 } from "trigger/etl/utils";
import { v4 } from "uuid";
import { createLogger } from "winston";
import { z } from "zod";
import sizeOf from "image-size";

const HEARTBEAT_INTERVAL = 15000;
const INTERNAL_SERVER_URL = process.env.INTERNAL_SERVER_URL || "http://localhost:8000";
const externalStorageUrl = process.env.STORAGE_URL || "http://localhost:8001/api/v1/media"; // used for frontend links
const internalStorageUrl = `${INTERNAL_SERVER_URL}/api/v1/media`;

const talkConfig = {
    bucket: process.env.TALK_BUCKET_NAME || "talk",
    exportedFolder: "exported",
};

interface S3Board {
    board: string | null;
    items: string[];
    connectors: string[];
    metaInfo: string | null;
    images: string[];
}

function splitBoardFiles(filePaths: string[]): S3Board {
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
        const taskJson = await s3.getJson(talkConfig.bucket, `tasks/${talkConfig.exportedFolder}/${taskId}.json`);
        await s3.updateJsonFile(talkConfig.bucket, `tasks/${talkConfig.exportedFolder}/${taskId}.json`, {
            ...taskJson,
            lastActivityTime: now,
        });
        await io.logger.log(`Last activity updated - ${now}`, { now });
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
        if (!payload.id) {
            await io.logger.error("Task id not provided, payload:", {
                payload,
            });
            throw new Error("Task id not provided");
        }
        const heartbeat = setInterval(async () => {
            await setLastActivity(payload.id, io);
        }, HEARTBEAT_INTERVAL);
        await setLastActivity(payload.id, io);

        try {
            const winstonLogger = createLogger();
            const database = await getDatabase(winstonLogger);
            const newBoardId = v4();

            const talktaskJsonTask = await io.try(
                async () => {
                    const taskJson = await io.runTask(
                        "Get JSON File",
                        async () =>
                            await s3.getJson(talkConfig.bucket, `tasks/${talkConfig.exportedFolder}/${payload.id}.json`)
                    );

                    return {
                        isSuccess: true as const,
                        data: taskJson,
                    };
                },
                async (error) => {
                    await io.logger.error(`Error fetching tasks`, { error });
                    return {
                        isSuccess: false as const,
                        error,
                    };
                }
            );

            if (talktaskJsonTask?.isSuccess === false) {
                throw talktaskJsonTask.error;
            }

            await io.logger.info("Importing board from Talk", {
                jsonFile: talktaskJsonTask,
            });
            const workerID = talktaskJsonTask.data?.WorkerName;
            if (!workerID) {
                throw new Error("Worker ID not found");
            }

            const boardFilesTask = await io.try(
                async () => {
                    const boardFilesTask = await io.runTask(
                        "List Files",
                        async () => await s3.listAllFiles(talkConfig.bucket, `${workerID}/${payload.id}`)
                    );

                    return {
                        isSuccess: true as const,
                        data: boardFilesTask,
                    };
                },
                async (error) => {
                    await io.logger.error(`Error fetching files`, { error });
                    return {
                        isSuccess: false as const,
                        error,
                    };
                }
            );
            if (boardFilesTask?.isSuccess === false) {
                throw boardFilesTask.error;
            }

            await io.logger.info("Files found", {
                files: boardFilesTask.data,
            });

            const boardData = splitBoardFiles(boardFilesTask.data);
            await io.logger.info("Board data", {
                boardData,
            });

            if (!boardData.board) {
                throw new Error("Board not found");
            }

            const boardTask = await io.try(
                async () => {
                    const boardTask = await io.runTask(
                        "Get Board",
                        async () => await s3.getJson(talkConfig.bucket, boardData.board!)
                    );

                    return {
                        isSuccess: true as const,
                        data: boardTask,
                    };
                },
                async (error) => {
                    await io.logger.error(`Error fetching board`, { error });
                    return {
                        isSuccess: false as const,
                        error,
                    };
                }
            );

            if (boardTask?.isSuccess === false) {
                throw boardTask.error;
            }

            await io.logger.info(`S3 Board fetched: ${boardData.board}`, {
                board: boardTask.data,
            });

            const fetchItemsFromS3 = async () => {
                const itemsTask = await io.try(
                    async () => {
                        const items = await io.runTask("Fetch items", async () => {
                            let items: any[] = [];
                            let imageProcessingPromises: Promise<void>[] = [];

                            for (const itemFilePath of boardData.items) {
                                const itemData = await s3.getJson(talkConfig.bucket, itemFilePath);

                                await io.logger.info(`Item fetched: ${itemFilePath}`, {
                                    itemData,
                                });

                                for (const data of itemData?.data || []) {
                                    if (data.type === "image") {
                                        const imageJsonPath = boardData.images.find((image) => image.includes(data.id));
                                        const processImagePromise = (async () => {
                                            try {
                                                const imageJson = await s3.getJson(talkConfig.bucket, imageJsonPath!);
                                                const hash = imageJson.FilePath;
                                                const talkDimensions = {
                                                    width: imageJson?.Width || null,
                                                    height: imageJson?.Height || null,
                                                };
                                                let dimensions = null;
                                                if (!talkDimensions?.width || !talkDimensions?.height) {
                                                    await io.logger.warn(
                                                        `Failed to parse image dimensions from TALK for image ${
                                                            imageJson.FilePath || data.id
                                                        }`
                                                    );
                                                    const base64 = await imageUrlToBase64(
                                                        `${internalStorageUrl}${hash}`
                                                    );
                                                    const base64Data = base64.replace(/^data:image\/\w+;base64,/, "");
                                                    const imgBuffer = Buffer.from(base64Data, "base64");
                                                    const uint8Array = Uint8Array.from(imgBuffer);
                                                    const firstByte = uint8Array[0];

                                                    if (firstByte === 117) {
                                                        // SVG
                                                        try {
                                                            const svgDimensions = await getSVGDimensionsFromURL(
                                                                `${internalStorageUrl}${hash}`
                                                            );
                                                            dimensions = {
                                                                width: svgDimensions.width || data.geometry?.width || 0,
                                                                height:
                                                                    svgDimensions.height || data.geometry?.height || 0,
                                                            };
                                                        } catch (_) {
                                                            dimensions = {
                                                                width: data.geometry?.width || 0,
                                                                height: data.geometry?.height || 0,
                                                            };
                                                        }
                                                    } else {
                                                        dimensions = sizeOf(uint8Array);
                                                    }
                                                } else {
                                                    dimensions = talkDimensions;
                                                }

                                                const copiedImage = { ...data };

                                                copiedImage.data.imageUrl = `${externalStorageUrl}${hash}`;
                                                copiedImage.dimensions = dimensions;
                                                await io.logger.log(`Processed image: ${data.id}`, {
                                                    image: copiedImage,
                                                });
                                                items.push({
                                                    item: copiedImage,
                                                    boardId: newBoardId,
                                                    userId: payload.userId,
                                                });
                                            } catch (e: any) {
                                                await io.logger.error(
                                                    `Error processing image item: ${imageJsonPath}, skipping...`,
                                                    {
                                                        error: JSON.stringify(e?.message),
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
                            return items;
                        });

                        return {
                            isSuccess: true as const,
                            data: items,
                        };
                    },
                    async (error) => {
                        await io.logger.error(`Error fetching items`, { error });
                        return {
                            isSuccess: false as const,
                            error,
                        };
                    }
                );

                if (itemsTask?.isSuccess === false) {
                    throw itemsTask.error;
                }

                const connectorsTask = await io.try(
                    async () => {
                        const connectors = await io.runTask("Fetch connectors", async () => {
                            let connectors: any[] = [];
                            for (const connectorFilePath of boardData.connectors) {
                                const connectorData = await s3.getJson(talkConfig.bucket, connectorFilePath);

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
                            return connectors;
                        });

                        return {
                            isSuccess: true as const,
                            data: connectors,
                        };
                    },
                    async (error) => {
                        await io.logger.error(`Error fetching connectors`, { error });
                        return {
                            isSuccess: false as const,
                            error,
                        };
                    }
                );

                if (connectorsTask?.isSuccess === false) {
                    throw connectorsTask.error;
                }

                const [items, connectors] = [itemsTask.data, connectorsTask.data];

                return {
                    items,
                    connectors,
                };
            };

            const { items, connectors } = await fetchItemsFromS3();

            const transformedBoard = await getTransformedBoard({
                miroBoard: boardTask.data,
                userId: payload.userId,
                items,
                connectors,
            });

            await io.logger.info(`Transformed board: `, {
                transformedBoard,
            });

            const boards = new Boards(database, winstonLogger);
            const createdBoard = await boards.saveBoardData(transformedBoard);

            if (createdBoard) {
                await io.logger.info(`import success: ${payload.id}`);
                await io.try(
                    async () => {
                        await io.runTask(`Update JSON File: success ${payload.id}}`, async () => {
                            await s3.updateJsonFile(
                                talkConfig.bucket,
                                `tasks/${talkConfig.exportedFolder}/${payload.id}.json`,
                                {
                                    ...talktaskJsonTask.data,
                                    MicroBoardId: createdBoard.boardId,
                                    MicroBoardEditLink: createdBoard.editLink,
                                }
                            );
                            await s3.moveFile(
                                talkConfig.bucket,
                                `tasks/${talkConfig.exportedFolder}/${payload.id}.json`,
                                `tasks/imported/${payload.id}.json`
                            );
                        });

                        return {
                            isSuccess: true as const,
                            data: true,
                        };
                    },
                    async (error) => {
                        await io.logger.error(`Error in import job for board ${payload.id}:`, {
                            error,
                        });
                        return {
                            isSuccess: false as const,
                            error,
                        };
                    }
                );
            } else {
                await io.logger.info(`import failed: ${payload.id}`);
                throw new Error(`Save board to db error: ${payload.id}`);
            }
        } catch (error) {
            await io.logger.error(`Error in import job for board ${payload.id}:`, {
                error,
            });
            await io.try(
                async () => {
                    await io.runTask("Import error", async () => {
                        const taskJson = await s3.getJson(
                            talkConfig.bucket,
                            `tasks/${talkConfig.exportedFolder}/${payload.id}.json`
                        );
                        await s3.updateJsonFile(
                            talkConfig.bucket,
                            `tasks/${talkConfig.exportedFolder}/${payload.id}.json`,
                            {
                                ...taskJson,
                                MetaInfo: {
                                    ...(taskJson.MetaInfo || {}),
                                    errorMessage: JSON.stringify(error),
                                },
                            }
                        );
                        await s3.moveFile(
                            talkConfig.bucket,
                            `tasks/${talkConfig.exportedFolder}/${payload.id}.json`,
                            `tasks/import-error/${payload.id}.json`
                        );
                    });
                },
                async (error) => {
                    await io.logger.error(`Error in import job for board ${payload.id}:`, {
                        error,
                    });
                    return {
                        isSuccess: false as const,
                        error,
                    };
                }
            );

            // throw error;
        } finally {
            clearInterval(heartbeat);
        }
    },
});
