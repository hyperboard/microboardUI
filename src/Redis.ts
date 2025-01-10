import RedisClient from "ioredis";
import winston from "winston";

export enum REDIS_HASH {
    PRESENCE = "presence:",
}

export interface Redis {
    client: RedisClient;
    set(options: { key: string; value: string; prefix: REDIS_HASH; exp?: number }): Promise<void>;
    hgetall(options: { hash: REDIS_HASH }): Promise<Record<string, string>>;
    hset(options: { hash: REDIS_HASH; field: string; value: string; exp: number }): Promise<number>;
    isHealthy(): Promise<boolean>;
    reconnect(): Promise<void>;
}

export async function getRedis(logger: winston.Logger): Promise<Redis> {
    let client = await createRedisClient(logger);

    client.on("error", (error) => {
        logger.error("Redis error:", error);
    });

    client.on("connect", () => {
        logger.info("Redis connected");
    });

    client.on("ready", () => {
        logger.info("Redis ready");
    });

    client.on("close", () => {
        logger.warn("Redis connection closed");
    });

    client.on("reconnecting", () => {
        logger.info("Redis reconnecting");
    });

    async function createRedisClient(logger: winston.Logger): Promise<RedisClient> {
        if (!process.env.REDIS_HOST) throw new Error("REDIS_HOST environment variable is required");
        if (!process.env.REDIS_PORT) throw new Error("REDIS_PORT environment variable is required");
        const options: any = {
            host: process.env.REDIS_LOCAL === "true" ? "redis" : process.env.REDIS_HOST,
            port: parseInt(process.env.REDIS_PORT),
            retryStrategy(times: number) {
                const delay = Math.min(times * 50, 2000);
                logger.warn(`Redis retry attempt ${times} with delay ${delay}ms`);
                return delay;
            },
            maxRetriesPerRequest: null,
            enableAutoPipelining: true,
            connectTimeout: 10000,
            disconnectTimeout: 2000,
            commandTimeout: 5000,
        };
        if (process.env.REDIS_LOCAL === "true") {
            options.password = "redis";
        }
        return new RedisClient(options);
    }

    async function set(options: { key: string; value: string; prefix: REDIS_HASH; exp?: number }) {
        const { key, value, prefix, exp = 60 * 60 } = options;

        await client.set(`${prefix}${key}`, value, "EX", 60);
    }

    async function hset(options: { hash: REDIS_HASH; field: string; value: string; exp: number }) {
        const { hash, field, value, exp = 60 * 60 } = options;
        const hashed = await client.hset(hash, field, value);
        await client.expire(hash, exp);

        return hashed;
    }

    async function hgetall(options: { hash: REDIS_HASH }) {
        const { hash } = options;
        return await client.hgetall(hash);
    }

    async function isHealthy(): Promise<boolean> {
        try {
            const ping = await client.ping();
            return ping === "PONG";
        } catch (error) {
            logger.error("Redis health check failed:", error);
            return false;
        }
    }

    async function reconnect(): Promise<void> {
        try {
            if (client) {
                await client.quit();
            }
            client = await createRedisClient(logger);
            await client.ping();
            logger.info("Redis reconnected successfully");
        } catch (error) {
            logger.error("Redis reconnection failed:", error);
            throw error;
        }
    }

    return {
        client,
        set,
        hgetall,
        hset,
        isHealthy,
        reconnect,
    };
}
