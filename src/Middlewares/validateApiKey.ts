import { Request, Response, NextFunction } from "express";
import { HttpException } from "shared/exceptions/http-exception";
import { HttpStatus } from "shared/enums/http-status.enum";
import { eq, and } from "drizzle-orm";
import { db } from "drizzle/db";
import { apiKeys } from "drizzle/entities/users";
import crypto from "crypto";

declare module "express" {
    interface Request {
        sub?: number;
    }
}

function hashApiKey(apiKey: string): string {
    return crypto.createHash("sha256").update(apiKey).digest("hex");
}

export async function validateApiKey(req: Request, res: Response, next: NextFunction) {
    const apiKey = req.headers["x-api-key"];

    if (!apiKey || typeof apiKey !== "string") {
        throw new HttpException(
            HttpStatus.UNAUTHORIZED,
            "API key is required. Please provide it in the X-API-Key header"
        );
    }

    const hashedKey = hashApiKey(apiKey);

    const [dbApiKey] = await db
        .select()
        .from(apiKeys)
        .where(and(eq(apiKeys.key, hashedKey)));

    if (!dbApiKey) {
        throw new HttpException(HttpStatus.UNAUTHORIZED, "Invalid API key");
    }

    if (!dbApiKey.userId) {
        throw new HttpException(HttpStatus.UNAUTHORIZED, "Invalid API key - no user associated");
    }

    req.sub = dbApiKey.userId;

    next();
}
