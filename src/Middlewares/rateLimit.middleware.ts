import { Request, Response, NextFunction } from "express";
import { Redis } from "Redis";
import { getCurrentUserPlan } from "../Routes/V1/Billing/utils";
import { HttpStatus } from "shared/enums/http-status.enum";
import winston from "winston";

const FREE_PLAN_NAME = "basic";
const FREE_PLAN_RATE_LIMIT = 600; // requests per hour
const RATE_LIMIT_WINDOW = 60 * 60; // 1 hour in seconds

export function rateLimitMiddleware(redis: Redis, logger: winston.Logger) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.sub;
            if (!userId) {
                return res.status(HttpStatus.UNAUTHORIZED).json({
                    status: HttpStatus.UNAUTHORIZED,
                    message: "Authentication required",
                });
            }

            const userPlan = await getCurrentUserPlan(+userId);

            if (userPlan.name !== FREE_PLAN_NAME) {
                return next();
            }

            const key = `rate_limit:${userId}`;
            const currentRequests = await redis.client.incr(key);

            if (currentRequests === 1) {
                await redis.client.expire(key, RATE_LIMIT_WINDOW);
            }

            if (currentRequests > FREE_PLAN_RATE_LIMIT) {
                return res.status(HttpStatus.TOO_MANY_REQUESTS).json({
                    status: HttpStatus.TOO_MANY_REQUESTS,
                    message: "Rate limit exceeded. Please upgrade your plan for unlimited requests.",
                });
            }

            res.setHeader("X-RateLimit-Limit", FREE_PLAN_RATE_LIMIT.toString());
            res.setHeader("X-RateLimit-Remaining", (FREE_PLAN_RATE_LIMIT - currentRequests).toString());

            next();
        } catch (error) {
            logger.error("Rate limit middleware error:", error);
            next(error);
        }
    };
}
