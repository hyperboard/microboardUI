import { Redis } from "Redis";
import { PresenceEventMsg, PresenceEventType } from "./withWebSocketApi";

export class Presence {
    private redis: Redis;
    private readonly EVENT_TTL = 30; // in seconds

    constructor(redisClient: Redis) {
        this.redis = redisClient;
    }

    private getEventKey(messageId: string): string {
        return `event:${messageId}`;
    }

    private getBoardKey(boardId: string): string {
        return `board:${boardId}:events`;
    }

    private getUserKey(userId: string): string {
        return `user:${userId}:events`;
    }

    async saveEvent(event: PresenceEventMsg): Promise<void> {
        const eventKey = this.getEventKey(event.messageId);
        const boardKey = this.getBoardKey(event.boardId);
        const userKey = this.getUserKey(event.userId);

        const multi = this.redis.client.multi();

        multi.hset(eventKey, {
            type: event.type,
            boardId: event.boardId,
            userId: event.userId,
            messageId: event.messageId,
            event: JSON.stringify(event.event),
            timestamp: event.event.timestamp,
        });
        multi.expire(eventKey, this.EVENT_TTL);

        multi.zadd(boardKey, event.event.timestamp, event.messageId);
        multi.expire(boardKey, this.EVENT_TTL);

        multi.zadd(userKey, event.event.timestamp, event.messageId);
        multi.expire(userKey, this.EVENT_TTL);

        await multi.exec();
    }

    async getBoardEvents(boardId: string): Promise<PresenceEventMsg[]> {
        const minTimestamp = Date.now() - this.EVENT_TTL * 1000;
        const boardKey = this.getBoardKey(boardId);

        const eventIds = await this.redis.client.zrangebyscore(boardKey, minTimestamp, "+inf");

        return this.getEventsFromIds(eventIds);
    }

    async getUserEvents(userId: string): Promise<PresenceEventMsg[]> {
        const minTimestamp = Date.now() - this.EVENT_TTL * 1000;
        const userKey = this.getUserKey(userId);

        const eventIds = await this.redis.client.zrangebyscore(userKey, minTimestamp, "+inf");

        return this.getEventsFromIds(eventIds);
    }

    private async getEventsFromIds(eventIds: string[]): Promise<PresenceEventMsg[]> {
        if (eventIds.length === 0) return [];

        const multi = this.redis.client.multi();

        for (const eventId of eventIds) {
            multi.hgetall(this.getEventKey(eventId));
        }

        const results = await multi.exec();
        if (!results) return [];

        return results
            .map(([err, data]) => {
                if (err || !data) return null;

                const event: PresenceEventMsg = {
                    type: "PresenceEvent",
                    boardId: (data as any).boardId,
                    userId: (data as any).userId,
                    messageId: (data as any).messageId,
                    event: JSON.parse((data as any).event) as PresenceEventType,
                    nickname: (data as any).nickname || "Anonymous",
                    color: (data as any).color,
                    avatar: (data as any)?.avatar || null,
                };

                return event;
            })
            .filter((event): event is PresenceEventMsg => event !== null);
    }

    async cleanup(): Promise<void> {
        const minTimestamp = Date.now() - this.EVENT_TTL * 1000;

        const boardKeys = await this.redis.client.keys("board:*:events");
        const userKeys = await this.redis.client.keys("user:*:events");

        const multi = this.redis.client.multi();

        [...boardKeys, ...userKeys].forEach((key) => {
            multi.zremrangebyscore(key, "-inf", minTimestamp);
        });

        await multi.exec();
    }
}
