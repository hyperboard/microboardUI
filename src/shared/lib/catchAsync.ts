import type { NextFunction, Request, Response } from "express";

export function catchAsync(fn: (req: Request, res: Response, next: NextFunction) => Promise<void | Response>) {
    return (req: Request, res: Response, next: NextFunction) => {
        fn(req, res, next).catch((err) => {
            next(err);
        });
    };
}
