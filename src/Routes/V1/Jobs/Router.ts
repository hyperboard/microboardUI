import express, { Request, Response } from "express";
import { body } from "express-validator";
import { healthCheckJob } from "trigger/jobs/health-check";
import { importMiroBoard } from "trigger/jobs/import-miro";
import winston from "winston";
import { WebSocketServer } from "ws";
import { catchAsync } from "shared/lib/catchAsync";
import { internalError } from "shared/lib/routing";

interface ImportMiroBoardsRequest {
    accessToken: string;
    userId: string;
    boardIds: string[];
}

export const createJobsRouter = (logger: winston.Logger, wss: WebSocketServer) => {
    const router = express.Router();

    router.post(
        "/jobs/import-miro-boards",
        body("accessToken").isString(),
        body("userId").isString(),
        body("boardIds").isArray(),
        catchAsync(async (req: Request, res: Response) => {
            const { accessToken, userId, boardIds } = req.body as ImportMiroBoardsRequest;
            try {
                for (const boardId of boardIds) {
                    await importMiroBoard.invoke({
                        accessToken,
                        userId,
                        boardId,
                    });
                }

                res.status(200).json({
                    message: "Import Miro board jobs started",
                });
            } catch (e) {
                logger.error("Error importing boards:", e);
                return internalError(res, e, "Error to start importing boards jobs");
            }
        }, logger)
    );

    router.post(
        "/jobs/notify",
        catchAsync(async (req: Request, res: Response) => {
            try {
                notifyClients(req.body, wss);
                return res.status(200).json({
                    message: "Job completed",
                });
            } catch (e) {
                return internalError(res, e, "Error to notify clients");
            }
        }, logger)
    );

    router.get(
        "/jobs/health",
        catchAsync(async (req: Request, res: Response) => {
            console.log("Test job endpoint");
            try {
                await healthCheckJob.invoke({});
                res.status(200)
                    .json({
                        message: "Test job endpoint invoked",
                    })
                    .end();
            } catch (e) {
                return internalError(res, e, "Error to invoke test job endpoint");
            }
        }, logger)
    );

    return router;
};

function notifyClients(
    payload: { type: string; userId?: string; boardId?: string; jobId?: string },
    wss: WebSocketServer
) {
    const message = JSON.stringify({
        ...payload,
    });

    if (wss.clients.size === 0) {
        return;
    }

    wss.clients.forEach((client) => {
        client.send(message);
    });
}
