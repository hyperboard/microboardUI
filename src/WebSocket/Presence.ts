import { Redis } from "Redis";
import { PresenceEventMsg, PresenceEventType } from "./withWebSocketApi";

export interface PresenceUser {
    nickname: string;
    boardId?: string;
    userId: string;
    softId: string | null;
    hardId: string | null;
    color: string; // rgb
    colorChangeable: boolean;
    lastActivity: number;
    lastPing: number;
    selection: string[];
    pointer: {
        x: number;
        y: number;
    };
    avatar: string | null;
    select?: {
        left: number;
        top: number;
        right: number;
        bottom: number;
    };
    camera: {
        translateX: number;
        translateY: number;
        scaleX: number;
        scaleY: number;
        shearX: number;
        shearY: number;
    } | null;
}

export class Presence {
    private redis: Redis;
    private readonly EVENT_TTL = 180; // in seconds

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

    async saveEvent(msg: PresenceEventMsg): Promise<void> {
        const eventKey = this.getEventKey(msg.messageId);
        const boardKey = this.getBoardKey(msg.boardId);
        const userKey = this.getUserKey(msg.userId);

        const multi = this.redis.client.multi();

        multi.hset(eventKey, {
            type: msg.type,
            boardId: msg.boardId,
            userId: msg.userId,
            messageId: msg.messageId,
            event: JSON.stringify(msg.event),
            timestamp: msg.event.timestamp,
            avatar: msg.avatar,
            color: msg.color,
            nickname: msg.nickname,
        });
        multi.expire(eventKey, this.EVENT_TTL);

        multi.zadd(boardKey, msg.event.timestamp, msg.messageId);
        multi.expire(boardKey, this.EVENT_TTL);

        multi.zadd(userKey, msg.event.timestamp, msg.messageId);
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
                try {
                    const event: PresenceEventMsg = {
                        type: "PresenceEvent",
                        boardId: (data as any).boardId,
                        userId: (data as any).userId,
                        messageId: (data as any).messageId,
                        /*
                        error: Failed to subscribe to board events: "undefined" is not valid JSON
                        error: "undefined" is not valid JSON 
                        "stack":"SyntaxError: \"undefined\" is not valid JSON\n    at JSON.parse (<anonymous>)\n    
                        at /usr/api/dist/api.js:916231:21\n    
                        at Array.map (<anonymous>)\n    
                        at Presence.getEventsFromIds (/usr/api/dist/api.js:916223:20)\n    
                        at process.processTicksAndRejections (node:internal/process/task_queues:95:5)\n    
                        at async Presence.createBoardPresenceSnapshots (/usr/api/dist/api.js:916329:26)\n    
                        at async sendPresenceSnapshots (/usr/api/dist/api.js:916619:23)\n    
                        at async handleSubscribeMsg (/usr/api/dist/api.js:916597:5)"}}
                        */
                        event: JSON.parse((data as any).event) as PresenceEventType,
                        nickname: (data as any).nickname || "Anonymous",
                        color: (data as any).color,
                        avatar: (data as any)?.avatar || null,
                        hardId: (data as any)?.hardId || null,
                        softId: (data as any)?.softId || null,
                    };
                    return event;
                } catch (error) {
                    return null;
                }
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

    async createPresenceUserSnapshot(userId: string): Promise<PresenceUser | null> {
        const events = await this.getUserEvents(userId);

        if (events.length === 0) return null;
        const snapshot: PresenceUser = {
            userId,
            boardId: undefined,
            nickname: userId,
            color: "rgb(128,128,128)", // fixme first color initialization
            colorChangeable: true,
            lastActivity: 0,
            lastPing: 0,
            selection: [],
            pointer: { x: 0, y: 0 },
            avatar: null,
            select: undefined,
            camera: null,
            hardId: null,
            softId: null,
        };
        const sortedEvents = events.sort((a, b) => (a.event.timestamp || 0) - (b.event.timestamp || 0));
        function setMetaInfo(msg: PresenceEventMsg) {
            snapshot.avatar = msg.avatar;
            snapshot.color = msg.color || "rgb(128,128,128)";
            snapshot.nickname = msg.nickname;
            snapshot.boardId = msg.boardId;
        }
        for (const msg of sortedEvents) {
            const event = msg.event;
            setMetaInfo(msg);

            snapshot.lastActivity = Math.max(snapshot.lastActivity, event.timestamp || 0);

            if (msg.nickname) {
                snapshot.nickname = msg.nickname;
            }

            if (msg.color) {
                snapshot.color = msg.color;
            }

            switch (event.method) {
                case "PointerMove":
                    snapshot.pointer = event.position;
                    break;

                case "Selection":
                    snapshot.selection = event.selectedItems;
                    break;

                case "SetUserColor":
                    snapshot.color = event.color;
                    break;

                case "DrawSelect":
                    snapshot.select = {
                        left: event.size.left,
                        top: event.size.top,
                        right: event.size.right,
                        bottom: event.size.bottom,
                    };
                    break;

                case "CancelDrawSelect":
                    snapshot.select = undefined;
                    break;

                case "Camera":
                    snapshot.camera = {
                        translateX: event.translateX,
                        translateY: event.translateY,
                        scaleX: event.scaleX,
                        scaleY: event.scaleY,
                        shearX: event.shearX,
                        shearY: event.shearY,
                    };
                    break;

                case "Ping":
                    snapshot.lastPing = event.timestamp;
                    break;
            }
        }

        const firstMsg = sortedEvents[0];
        snapshot.avatar = firstMsg?.avatar || null;

        return snapshot;
    }

    async createBoardPresenceSnapshots(boardId: string): Promise<Record<string, PresenceUser>> {
        const boardEvents = await this.getBoardEvents(boardId);

        const eventsByUser: Record<string, PresenceEventMsg[]> = {};
        boardEvents.forEach((event) => {
            if (!eventsByUser[event.userId]) {
                eventsByUser[event.userId] = [];
            }
            eventsByUser[event.userId].push(event);
        });

        const snapshots: Record<string, PresenceUser> = {};

        for (const userId of Object.keys(eventsByUser)) {
            const snapshot = await this.createPresenceUserSnapshot(userId);
            if (snapshot) {
                snapshots[userId] = snapshot;
            }
        }

        return snapshots;
    }
}
