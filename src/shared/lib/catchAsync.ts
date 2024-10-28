import type { NextFunction, Request, Response } from "express";
import type winston from "winston";
import { internalError } from "./routing";

export function catchAsync(
    fn: (req: Request, res: Response, next: NextFunction) => Promise<void | Response>,
    logger?: winston.Logger
) {
    return (req: Request, res: Response, next: NextFunction) => {
        fn(req, res, next).catch((err) => {
            logger?.warn(`Unhandled rejection in ${req.url} handler`);
            if (err instanceof Error) {
                logger?.warn(err.message);
                console.error(err);
            }
            return internalError(res, err);
        });
    };
}
