import { Request, Response, NextFunction } from "express";
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
    try {
        const apiKey = req.headers["x-api-key"];

        if (!apiKey || typeof apiKey !== "string") {
            return res.status(HttpStatus.UNAUTHORIZED).json({
                status: HttpStatus.UNAUTHORIZED,
                message: "API key is required. Please provide it in the X-API-Key header",
            });
        }

        const hashedKey = hashApiKey(apiKey);

        const [dbApiKey] = await db
            .select()
            .from(apiKeys)
            .where(and(eq(apiKeys.key, hashedKey)));

        if (!dbApiKey) {
            return res.status(HttpStatus.UNAUTHORIZED).json({
                status: HttpStatus.UNAUTHORIZED,
                message: "Invalid API key",
            });
        }

        if (!dbApiKey.userId) {
            return res.status(HttpStatus.UNAUTHORIZED).json({
                status: HttpStatus.UNAUTHORIZED,
                message: "Invalid API key - no user associated",
            });
        }

        req.sub = dbApiKey.userId;
        next();
    } catch (error) {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            message: "An error occurred while validating the API key",
        });
    }
}
