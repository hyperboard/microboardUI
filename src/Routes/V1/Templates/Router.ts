import express, {Request, Response} from "express";
import {body, param, query, validationResult} from "express-validator";
import {catchAsync} from "../../../shared/lib/catchAsync";
import winston from "winston";
import {internalError} from "../../../shared/lib/routing";
import {checkPermissions, forbidden} from "../Boards/Router";
import {Templates} from "./Templates";
import {HttpException} from "../../../shared/exceptions/http-exception";

export function getTemplatesRouter(
    templates: Templates,
    logger: winston.Logger
): express.Router {
    const router = express.Router();

    router.get(
        "/templates",
        query("term").optional().isString(),
        query("language").isString(),
        query("tag").optional().isString(),
        catchAsync(async (req: Request, res: Response) => {
            try {
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    return res.status(400).json({errors: errors.array()});
                }

                const term = req.query.term as string | null
                const language = req.query.language as string
                const tag = req.query.tag as string | null

                const result = await templates.getTemplates(language, term || undefined, tag || undefined);
                if (!result) {
                    res.status(404).end();
                    return;
                }

                return res.status(200).json(result);
            } catch (err) {
                logger.error(`Error while getting Templates: ${err}`);
                return res.status(404).send("Not found");
            }
        }, logger)
    );

    router.patch(
        "/templates/:boardId",
        param("boardId").isUUID(),
        body("snapshot").isObject(),
        catchAsync(async (req: Request, res: Response) => {
            try {
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    return res.status(400).json({errors: errors.array()});
                }

                const boardId = req.params.boardId;
                const {snapshot} = req.body

                if (
                    checkPermissions(req.token, "owns", "boards", boardId)
                ) {
                    return forbidden(res);
                }

                await templates.saveTemplateSnapshot(boardId, snapshot);

                return res.status(201).send();
            } catch (err) {
                logger.error(`Error while saving Template for boardId: ${req.params.boardId}: ${err}`);
                if (err instanceof HttpException && err.status === 404) {
                    return res.status(404).send("Not found");
                }
                return internalError(res, err);
            }
        }, logger)
    );

    router.post(
        "/templates/:boardId",
        param("boardId").isUUID(),
        body("snapshot").isObject(),
        body("languages").isArray(),
        body("description").isObject(),
        body("tags").isArray(),
        body("name").isObject(),
        catchAsync(async (req: Request, res: Response) => {
                try {
                    const errors = validationResult(req);
                    if (!errors.isEmpty()) {
                        return res.status(400).json({errors: errors.array()});
                    }

                    const boardId = req.params.boardId;
                    const {snapshot, languages, description, tags, preview, name} = req.body

                    if (
                        checkPermissions(req.token, "owns", "boards", boardId)
                    ) {
                        return forbidden(res);
                    }

                    await templates.createTemplate(boardId, description, name, languages, tags, snapshot, preview);

                    return res.status(201).send();
                } catch (err) {
                    logger.error(`Error while creating Template for boardId: ${req.params.boardId}: ${err}`);
                    return internalError(res, err);
                }
            }, logger
        )
    );

    return router;
}