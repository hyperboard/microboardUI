import { invokeTrigger } from "@trigger.dev/sdk";
import { z } from "zod";
import { Boards } from "../../Routes/V1/Boards";
import { client } from "..";
import { getDatabase } from "../../Database";
import { createLogger } from "winston";
import { Board, MiroApi } from "@mirohq/miro-api";
import { BUCKET_NAME, minioClient } from "Routes/V1/Media/MinioClient";
import { v4 } from "uuid";
import { getTransformedBoard } from "trigger/etl/parsers";
import { fetchAndProcessItems, fetchAndProcessConnectors } from "../etl/utils";

interface ExtractedBoard {
    board: Board;
    items: any[];
}

const INTERNAL_SERVER_URL = process.env.INTERNAL_SERVER_URL || "http://localhost:8000";
const NOTIFY_URL = `${INTERNAL_SERVER_URL}/api/v1/jobs/notify`;

export const importMiroBoard = client.defineJob({
    id: "import-miro-board",
    name: "Import Miro Board",
    version: "0.0.1",
    trigger: invokeTrigger({
        schema: z.object({
            boardId: z.string(),
            accessToken: z.string(),
            userId: z.string(),
        }),
    }),
    run: async (payload, io, ctx) => {
        const { boardId, accessToken, userId } = payload;
        try {
            const winstonLogger = createLogger();
            const database = await getDatabase(winstonLogger);
            const miroApi = new MiroApi(accessToken);
            await io.logger.info(`Starting import job for Miro board: ${boardId}`);

            const board = await miroApi.getBoard(boardId);

            const newBoardId = v4();
            await io.logger.debug(`Board fetched: ${boardId}`, {
                board,
            });

            const extractedBoard: ExtractedBoard = {
                board,
                items: [],
            };

            let connectors: any[] = [];
            let items: any[] = [];
            await io.runTask("process Items", async () => {
                items = await io.runTask("fetch and process items", async () => {
                    return await fetchAndProcessItems(boardId, accessToken, newBoardId, userId, io);
                });

                const connectorsTask = await io.runTask("fetch and process connectors", async () => {
                    return await fetchAndProcessConnectors(board, io, newBoardId, userId);
                });

                if (connectorsTask) {
                    connectors = connectorsTask;
                }

                extractedBoard.items = [...items, ...connectors];
            });

            await io.logger.info(`Extracted board: `, {
                extractedBoard,
            });

            const transformedBoard = await io.runTask("transform Board", async () => {
                return await getTransformedBoard({
                    miroBoard: board,
                    userId: userId,
                    items,
                    connectors,
                });
            });

            minioClient!.putObject(BUCKET_NAME, `${boardId}.json`, JSON.stringify(transformedBoard));

            await io.logger.info(`Transformed board: `, {
                transformedBoard,
            });

            const boards = new Boards(database, winstonLogger);
            const savedBoard = await boards.saveBoardData(transformedBoard);

            const notifyResponse = await io.runTask("notify clients", async () => {
                const response = await fetch(NOTIFY_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        type: "JobComplete-ImportMiroBoard",
                        userId,
                        jobId: ctx.run.id,
                        boardId: savedBoard.editLink,
                    }),
                });

                return response.json();
            });

            await io.logger.info(`Notify response: `, {
                notifyResponse,
            });

            await io.logger.info(`Import job completed successfully for board: ${boardId}`);
        } catch (error) {
            await io.runTask("notify clients", async () => {
                const response = await fetch(NOTIFY_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        type: "JobComplete-ImportMiroBoard",
                        userId,
                        jobId: ctx.run.id,
                    }),
                });

                return response.json();
            });
            await io.logger.error(`Error in import job for board ${boardId}:`, {
                error,
            });
            throw error;
        }
    },
});
