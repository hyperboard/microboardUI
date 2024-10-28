import { Response } from "express";
import { parseError } from "./errorToJson";

export function internalError(res: Response, err: any, message?: string) {
    res.status(500).json({
        message: message || "Server error",
        error: parseError(err),
    });
}
