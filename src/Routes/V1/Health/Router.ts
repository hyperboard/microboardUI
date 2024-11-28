import express from "express";
import { Redis } from "Redis";
import winston from "winston";

export const createHealthRouter = (logger: winston.Logger, redis: Redis): express.Router => {
    const router = express.Router();

    router.get("/health/redis", async (req, res) => {
        try {
            const isHealthy = await redis.isHealthy();

            if (!isHealthy) {
                logger.warn("Redis health check failed, attempting reconnection");
                try {
                    await redis.reconnect();
                    return res.status(200).json({
                        status: "recovered",
                        message: "Redis reconnected successfully",
                    });
                } catch (error) {
                    return res.status(503).json({
                        status: "error",
                        message: "Redis reconnection failed",
                        error: error instanceof Error ? error.message : "Unknown error",
                    });
                }
            }

            return res.status(200).json({
                status: "healthy",
                message: "Redis connection is healthy",
            });
        } catch (error) {
            logger.error("Health check error:", error);
            return res.status(503).json({
                status: "error",
                message: "Redis health check failed",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    });

    return router;
};
