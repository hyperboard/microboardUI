import express, { Response, Request } from "express";
import { body } from "express-validator";
import { talkIntegrationJob } from "trigger/jobs/talk";
export function createTalkRouter() {
    const router = express.Router();

    router.post("/talk/transform", body("taskId").isString(), async (req: Request, res: Response) => {
        try {
            const job = await talkIntegrationJob.invoke({
                id: req.body.taskId,
                userId: "0",
            });

            res.status(200).json({
                message: "Talk integration job started",
                job,
            });
        } catch (e) {
            res.status(500).json({
                error: "Error to start talk integration job",
            });
        }
    });

    return router;
}
