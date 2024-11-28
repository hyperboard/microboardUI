import winston from "winston";
import express, {Request, Response} from "express";
import {AI} from "./AI";
import {catchAsync} from "shared/lib/catchAsync";
import {validateRequest} from "shared/utils/router";
import {body} from "express-validator";
import {internalError} from "shared/lib/routing";

export function getAIRouter(ai: AI, logger: winston.Logger): express.Router {
    const router = express.Router();

    // TODO: create chat, reuse context

    router.post(
        "/ai/generate",
        // authenticate,
        body("input").isString(),
        body("withContext").optional().isBoolean(),
        validateRequest,
        catchAsync(async (req: Request, res: Response) => {
            const response = await ai.generateSimpleChart(req.body.input);

            if (response) {
                try {
                    return res.json({message: response});
                } catch (e) {
                    console.warn("Failed to parse openai response");
                }

                return res.json({message: response});
            }

            return internalError(res, null);
        })
    );

    return router;
}
