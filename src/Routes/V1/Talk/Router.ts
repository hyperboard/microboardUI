import express, { Response, Request } from "express";
import { body } from "express-validator";
import { talkIntegrationJob } from "trigger/jobs/talk";
export function createTalkRouter() {
    const router = express.Router();

    router.post(
        "/talk/transform",
        body("taskId").isString().notEmpty(),
        body("userId").optional().isString(),
        async (req: Request, res: Response) => {
            try {
                const taskId = req?.body?.taskId;
                if (!taskId) {
                    return res.status(400).json({
                        error: "Invalid task id",
                        message: `Provided task id: ${taskId}`,
                    });
                }
                const job = await talkIntegrationJob.invoke({
                    id: taskId,
                    userId: req.body.userId || "0",
                });

                return res.status(200).json({
                    message: "Talk integration job started",
                    job,
                });
            } catch (e) {
                return res.status(500).json({
                    error: "Error to start talk integration job",
                });
            }
        }
    );

    return router;
}
