import { db } from "drizzle/db";
import { ApiKey, apiKeys } from "drizzle/entities/users";
import crypto from "crypto";
import { v4 } from "uuid";
import { eq, and } from "drizzle-orm";
import { boardEvents, boards } from "drizzle/entities";
import { config } from "dotenv";
import { transformUpdateOperation, UpdateOperation } from "./Transformers/Update";
import { transformDeleteOperation } from "./Transformers/Delete";
import { transformCreateOperation, CreateOperation } from "./Transformers/Create";
// import { Boards } from "../Boards";
import winston from "winston";
import { Redis } from "Redis";
import {
    CreateItemRequest,
    UpdateItemRequest,
    RichText,
    ShapeType,
    FrameType,
    Point,
    Transformation,
    TextStyle,
    TextBlock,
    BorderStyle,
    ShapeTypes,
    FrameTypes,
    BorderStyles,
    isShapeType,
    isFrameType,
    isBorderStyle,
} from "./types";
import { HttpStatus } from "shared/enums/http-status.enum";
import { HttpException } from "shared/exceptions/http-exception";
import { BoardsService } from "../Boards/boards.service";

config();

export const ENCRYPTION_KEY = crypto.scryptSync(process.env.API_KEY_ENCRYPTION_KEY || "your-secret-key", "salt", 32);
export const ENCRYPTION_IV_LENGTH = 16;

export type BoardItemType = "Shape" | "Sticker" | "RichText" | "Frame" | "Drawing";

export interface BoardItem {
    id: string;
    itemType: BoardItemType;
    transformation: Required<Transformation>;
    text?: RichText;
    shapeType?: ShapeType | FrameType;
    borderColor?: string;
    borderStyle?: BorderStyle;
    borderWidth?: number;
    borderOpacity?: number;
    backgroundColor?: string;
    backgroundOpacity?: number;
    canChangeRatio?: boolean;
    children?: string[];
    points?: Point[];
    strokeStyle?: string;
    strokeWidth?: number;
    order?: number;
}

export class DevelopersService {
    private readonly BOARD_LAST_ORDER_KEY = "board:last_order:";

    constructor(private boards: BoardsService, private logger: winston.Logger, private redis: Redis) {}

    // TODO: find in code
    private async getBoardUuid(boardId: number): Promise<string> {
        const [boardWithUUID] = await db.select().from(boards).where(eq(boards.id, boardId)).limit(1);
        if (!boardWithUUID) {
            throw new HttpException(HttpStatus.NOT_FOUND, "Board not found");
        }
        return boardWithUUID.uniqId;
    }

    private generateApiKey(): string {
        const apiKey = `mk_${crypto.randomBytes(32).toString("hex")}`;
        return apiKey;
    }

    private encryptApiKey(apiKey: string): string {
        const iv = crypto.randomBytes(ENCRYPTION_IV_LENGTH);
        const cipher = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
        const encrypted = cipher.update(apiKey, "utf8", "hex") + cipher.final("hex");
        return `${iv.toString("hex")}:${encrypted}`;
    }

    private decryptApiKey(encryptedData: string): string {
        const [ivHex, encryptedKey] = encryptedData.split(":");
        const iv = Buffer.from(ivHex, "hex");
        const decipher = crypto.createDecipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
        return decipher.update(encryptedKey, "hex", "utf8") + decipher.final("utf8");
    }

    private hashApiKey(apiKey: string): string {
        return crypto.createHash("sha256").update(apiKey).digest("hex");
    }

    async createApiKey(userId: number): Promise<ApiKey> {
        await db.delete(apiKeys).where(eq(apiKeys.userId, userId));

        const apiKey = this.generateApiKey();
        const hashedKey = this.hashApiKey(apiKey);
        const name = `API Key created on ${new Date().toLocaleDateString()}`;

        const [createdKey] = await db
            .insert(apiKeys)
            .values({
                userId: userId,
                key: hashedKey,
                name: name,
                createdAt: new Date(),
            })
            .returning();

        return {
            ...createdKey,
            key: apiKey, // Return the actual API key only during creation
            message: "⚠️ Save this API key securely. It won't be shown again.",
        };
    }

    async listApiKeys(userId: number): Promise<Omit<ApiKey, "key"> | ApiKey> {
        const [key] = await db.select().from(apiKeys).where(eq(apiKeys.userId, userId)).limit(1);

        if (!key) {
            // Only case where we return the actual API key
            return await this.createApiKey(userId);
        }

        return {
            id: key.id,
            userId: key.userId,
            name: key.name,
            createdAt: key.createdAt,
            lastUsedAt: key.lastUsedAt,
            message: "For security, the API key is hidden. Generate a new one if needed.",
        };
    }

    async validateApiKey(apiKey: string): Promise<boolean> {
        const hashedKey = this.hashApiKey(apiKey);
        const [key] = await db.select().from(apiKeys).where(eq(apiKeys.key, hashedKey));

        if (key) {
            await db.update(apiKeys).set({ lastUsedAt: new Date() }).where(eq(apiKeys.id, key.id));
            return true;
        }

        return false;
    }

    async revokeApiKey(userId: number, keyId: string): Promise<void> {
        await db.delete(apiKeys).where(and(eq(apiKeys.userId, userId), eq(apiKeys.id, parseInt(keyId))));
    }

    async listAccessibleBoards(userId: number): Promise<any[]> {
        throw new Error("Not implemented");
    }

    private getBoardItemsKey(boardId: string): string {
        return `board:${boardId}:items`;
    }

    private getBoardItemKey(boardId: string, itemId: string): string {
        return `board:${boardId}:item:${itemId}`;
    }

    private async getAndIncrementOrder(boardId: string): Promise<number> {
        const key = this.BOARD_LAST_ORDER_KEY + boardId;
        const order = await this.redis.client.get(key);

        if (!order) {
            const lastOrder = await this.boards.getLastEventOrderForBoard(boardId);
            await this.redis.client.set(key, lastOrder.toString());
            return lastOrder + 1;
        }

        const nextOrder = parseInt(order) + 1;
        await this.redis.client.set(key, nextOrder.toString());
        return nextOrder;
    }

    async getBoardItems<T extends BoardItem>(boardId: string): Promise<T[]> {
        const cachedItems = await this.redis.client.get(this.getBoardItemsKey(boardId));
        if (cachedItems) {
            try {
                return JSON.parse(cachedItems);
            } catch (error) {
                this.logger.error("Failed to parse cached items:", error);
            }
        }

        const snapshot = await this.boards.getLatestBoardSnapshot(boardId);
        if (!snapshot) {
            return [];
        }

        try {
            const items = snapshot.items;
            if (!Array.isArray(items)) {
                this.logger.error("Items is not an array:", items);
                return [];
            }

            await this.redis.client.set(
                this.getBoardItemsKey(boardId),
                JSON.stringify(items),
                "EX",
                3600 // 1 hour
            );

            return items as T[];
        } catch (error) {
            this.logger.error("Failed to process board items:", error);
            return [];
        }
    }

    async getBoardItemById(boardId: string, itemId: string): Promise<BoardItem | null> {
        try {
            const cachedItem = await this.redis.client.get(this.getBoardItemKey(boardId, itemId));
            if (cachedItem) {
                return JSON.parse(cachedItem);
            }

            const items = await this.getBoardItems<BoardItem>(boardId);
            const item = items.find((obj) => obj.id === itemId);

            if (item) {
                await this.redis.client.set(
                    this.getBoardItemKey(boardId, itemId),
                    JSON.stringify(item),
                    "EX",
                    3600 // 1 hour
                );

                return item;
            }

            return null;
        } catch (error) {
            this.logger.error("Failed to get board item by ID:", error);
            return null;
        }
    }

    async createBoardItem(boardId: number, request: CreateItemRequest): Promise<BoardItem> {
        const boardUuid = await this.getBoardUuid(boardId);
        const defaultText: RichText = {
            children: [
                {
                    type: "paragraph",
                    children: [
                        {
                            text: "",
                            type: "text",
                            bold: false,
                            italic: false,
                            fontSize: 14,
                            overline: false,
                            fontColor: "black",
                            subscript: false,
                            underline: false,
                            fontFamily: "Open Sans",
                            lineHeight: 1.4,
                            lineThrough: false,
                            superscript: false,
                            fontHighlight: "",
                        },
                    ],
                    horisontalAlignment: "center",
                },
            ],
            insideOf: request.type === "RichText" ? "RichText" : "Shape",
            itemType: "RichText",
            realSize: 14,
            placeholderText: " ",
            verticalAlignment: "center",
        };

        const item: Omit<BoardItem, "id" | "order"> = {
            itemType: request.type,
            transformation: {
                rotate: request.transformation?.rotate ?? 0,
                scaleX: request.transformation?.scaleX ?? 1,
                scaleY: request.transformation?.scaleY ?? 1,
                translateX: request.transformation?.translateX ?? 0,
                translateY: request.transformation?.translateY ?? 0,
            },
            text: request.text ?? defaultText,
            shapeType: request.shapeType,
            borderColor: request.borderColor,
            borderStyle: request.borderStyle,
            borderWidth: request.borderWidth,
            borderOpacity: request.borderOpacity,
            backgroundColor: request.backgroundColor,
            backgroundOpacity: request.backgroundOpacity,
            canChangeRatio: request.canChangeRatio,
            children: request.children,
            points: request.points,
            strokeStyle: request.strokeStyle,
            strokeWidth: request.strokeWidth,
        };

        const order = await this.getAndIncrementOrder(boardUuid);
        const newItem = await this._createBoardItem(boardUuid, item, order);

        try {
            await this.redis.client.set(
                this.getBoardItemKey(boardUuid, newItem.id),
                JSON.stringify(newItem),
                "EX",
                3600 // 1 hour
            );

            await this.redis.client.del(this.getBoardItemsKey(boardUuid));

            return newItem;
        } catch (error) {
            this.logger.error("Failed to cache new board item:", error);
            return newItem;
        }
    }

    private async _createBoardItem(
        boardId: string,
        item: Omit<BoardItem, "id" | "order">,
        order: number
    ): Promise<BoardItem> {
        const newItemId = v4();

        let operation: CreateOperation;
        switch (item.itemType) {
            case "Shape": {
                const defaultShapeType = ShapeTypes[0];
                const shapeType = item.shapeType && isShapeType(item.shapeType) ? item.shapeType : defaultShapeType;
                operation = {
                    itemType: "Shape",
                    // @ts-ignore
                    shapeType: shapeType as ShapeType,
                    width: item.transformation.scaleX * 100,
                    height: item.transformation.scaleY * 100,
                } as const;
                break;
            }
            case "Sticker":
                operation = {
                    itemType: "Sticker",
                    text: item.text?.children[0]?.children[0]?.text || "",
                    color: item.backgroundColor || "rgb(174, 212, 250)", // Sky Blue default
                } as const;
                break;
            case "RichText":
                operation = {
                    itemType: "RichText",
                    text: item.text?.children[0]?.children[0]?.text || "",
                } as const;
                break;
            case "Frame":
                operation = {
                    itemType: "Frame",
                    width: item.transformation.scaleX * 100,
                    height: item.transformation.scaleY * 100,
                    position: {
                        x: item.transformation.translateX,
                        y: item.transformation.translateY,
                    },
                } as const;
                break;
            case "Drawing":
                operation = {
                    itemType: "Drawing",
                    points: item.points || [],
                    lineColor: item.strokeStyle || "rgb(20, 21, 26)",
                    lineWidth: item.strokeWidth || 1,
                    lineOpacity: 1,
                } as const;
                break;
            default:
                throw new Error(`Unsupported item type: ${item.itemType}`);
        }

        // TODO : fix user id
        const event = transformCreateOperation({
            boardId,
            userId: 0,
            order,
            itemId: newItemId,
            operation,
        });

        await db.insert(boardEvents).values({
            boardId: parseInt(boardId),
            logId: order,
            eventId: event.eventId,
            eventBody: event,
        });

        await this.redis.client.set(this.BOARD_LAST_ORDER_KEY + boardId, order.toString());

        return {
            id: newItemId,
            ...item,
            order,
        };
    }

    async updateBoardItem(options: {
        boardId: string;
        itemId: string;
        userId: number;
        operation: UpdateItemRequest;
    }): Promise<void> {
        const { boardId, itemId, userId, operation } = options;
        const order = await this.getAndIncrementOrder(boardId);

        const existingItem = await this.getBoardItemById(boardId, itemId);
        if (!existingItem) {
            throw new HttpException(HttpStatus.NOT_FOUND, "Item not found");
        }

        let updateOperation: UpdateOperation;
        const itemType = existingItem.itemType;
        switch (itemType) {
            case "Shape": {
                if (operation.shapeType && isShapeType(operation.shapeType)) {
                    updateOperation = {
                        itemType: "Shape",
                        method: "setShapeType",
                        // @ts-ignore
                        shapeType: operation.shapeType as ShapeType,
                        backgroundColor: operation.backgroundColor || "",
                        backgroundOpacity: operation.backgroundOpacity ?? 1,
                        borderColor: operation.borderColor || "",
                        borderStyle: isBorderStyle(operation.borderStyle) ? operation.borderStyle : BorderStyles[0],
                        borderWidth: operation.borderWidth,
                    };
                } else {
                    throw new Error("Invalid shape type");
                }
                break;
            }
            case "Frame": {
                if (operation.backgroundColor) {
                    updateOperation = {
                        itemType: "Frame",
                        method: "setBackgroundColor",
                        backgroundColor: operation.backgroundColor,
                    };
                } else if (operation.shapeType && isFrameType(operation.shapeType)) {
                    const defaultFrameType = FrameTypes[0];
                    updateOperation = {
                        itemType: "Frame",
                        method: "setFrameType",
                        shapeType: operation.shapeType,
                        prevShapeType:
                            existingItem.shapeType && isFrameType(existingItem.shapeType)
                                ? existingItem.shapeType
                                : defaultFrameType,
                    };
                } else {
                    throw new Error("Invalid frame update operation");
                }
                break;
            }
            case "Sticker":
                updateOperation = {
                    itemType: "Sticker",
                    method: "setBackgroundColor",
                    backgroundColor: operation.backgroundColor || existingItem.backgroundColor || "",
                };
                break;
            case "RichText":
                updateOperation = {
                    itemType: "RichText",
                    method: "edit",
                    ops: [
                        {
                            type: "text",
                            path: [],
                            text: operation.text?.children[0]?.children[0]?.text || "",
                        },
                    ],
                };
                break;
            default:
                throw new Error(`Unsupported item type: ${itemType}`);
        }

        await this._updateBoardItem({
            boardId,
            itemId,
            userId,
            order,
            operation: updateOperation,
        });

        await this.redis.client.del(this.getBoardItemKey(boardId, itemId));
        await this.redis.client.del(this.getBoardItemsKey(boardId));
    }

    private async _updateBoardItem(options: {
        boardId: string;
        itemId: string;
        userId: number;
        order: number;
        operation: UpdateOperation;
    }): Promise<void> {
        const { boardId, itemId, userId, order, operation } = options;

        const transformedEvent = transformUpdateOperation(operation, {
            boardId,
            userId,
            order,
            itemId,
        });

        await db.insert(boardEvents).values({
            boardId: parseInt(boardId),
            logId: order,
            eventId: `${userId}:${order}`,
            eventBody: transformedEvent,
        });

        await this.redis.client.set(this.BOARD_LAST_ORDER_KEY + boardId, order.toString());
    }

    async deleteBoardItem(options: { boardId: string; itemId: string; userId: number }): Promise<void> {
        const { boardId, itemId, userId } = options;
        const order = await this.getAndIncrementOrder(boardId);

        await this._deleteBoardItem({
            boardId,
            itemId,
            userId,
            order,
        });

        await this.redis.client.del(this.getBoardItemKey(boardId, itemId));
        await this.redis.client.del(this.getBoardItemsKey(boardId));
    }

    private async _deleteBoardItem(options: {
        boardId: string;
        itemId: string;
        userId: number;
        order: number;
    }): Promise<void> {
        const { boardId, itemId, userId, order } = options;
        const transformedEvent = transformDeleteOperation({ boardId, userId, order, itemId: itemId });

        await db.insert(boardEvents).values({
            boardId: parseInt(boardId),
            logId: order,
            eventId: "delete",
            eventBody: transformedEvent,
        });

        await this.redis.client.set(this.BOARD_LAST_ORDER_KEY + boardId, order.toString());
    }

    async batchUpdateItems(
        boardId: string,
        operations: Array<{
            type: "create" | "update" | "delete";
            itemId?: string;
            data?: CreateItemRequest | UpdateItemRequest;
        }>
    ): Promise<BoardItem[]> {
        let order = await this.getAndIncrementOrder(boardId);

        for (const op of operations) {
            switch (op.type) {
                case "create":
                    if (!op.data || !("type" in op.data)) {
                        throw new HttpException(HttpStatus.BAD_REQUEST, "Invalid create operation data");
                    }
                    const item: Omit<BoardItem, "id" | "order"> = {
                        itemType: op.data.type,
                        transformation: {
                            rotate: op.data.transformation?.rotate ?? 0,
                            scaleX: op.data.transformation?.scaleX ?? 1,
                            scaleY: op.data.transformation?.scaleY ?? 1,
                            translateX: op.data.transformation?.translateX ?? 0,
                            translateY: op.data.transformation?.translateY ?? 0,
                        },
                        text: op.data.text,
                        shapeType: op.data.shapeType,
                        borderColor: op.data.borderColor,
                        borderStyle: op.data.borderStyle,
                        borderWidth: op.data.borderWidth,
                        borderOpacity: op.data.borderOpacity,
                        backgroundColor: op.data.backgroundColor,
                        backgroundOpacity: op.data.backgroundOpacity,
                        canChangeRatio: op.data.canChangeRatio,
                        children: op.data.children,
                        points: op.data.points,
                        strokeStyle: op.data.strokeStyle,
                        strokeWidth: op.data.strokeWidth,
                    };
                    await this._createBoardItem(boardId, item, order);
                    break;
                case "update":
                    if (!op.itemId || !op.data) {
                        throw new HttpException(HttpStatus.BAD_REQUEST, "Invalid update operation data");
                    }
                    const existingItem = await this.getBoardItemById(boardId, op.itemId);
                    if (!existingItem) {
                        throw new HttpException(HttpStatus.NOT_FOUND, "Item not found");
                    }
                    let updateOperation: UpdateOperation;
                    const itemType = existingItem.itemType;
                    switch (itemType) {
                        case "Shape": {
                            if (op.data.shapeType && isShapeType(op.data.shapeType)) {
                                updateOperation = {
                                    itemType: "Shape",
                                    method: "setShapeType",
                                    // @ts-ignore
                                    shapeType: op.data.shapeType as ShapeType,
                                    backgroundColor: op.data.backgroundColor || "",
                                    backgroundOpacity: op.data.backgroundOpacity ?? 1,
                                    borderColor: op.data.borderColor || "",
                                    borderStyle: isBorderStyle(op.data.borderStyle)
                                        ? op.data.borderStyle
                                        : BorderStyles[0],
                                    borderWidth: op.data.borderWidth,
                                };
                            } else {
                                throw new Error("Invalid shape type");
                            }
                            break;
                        }
                        case "Frame": {
                            if (op.data.backgroundColor) {
                                updateOperation = {
                                    itemType: "Frame",
                                    method: "setBackgroundColor",
                                    backgroundColor: op.data.backgroundColor,
                                };
                            } else if (op.data.shapeType && isFrameType(op.data.shapeType)) {
                                const defaultFrameType = FrameTypes[0];
                                updateOperation = {
                                    itemType: "Frame",
                                    method: "setFrameType",
                                    shapeType: op.data.shapeType,
                                    prevShapeType:
                                        existingItem.shapeType && isFrameType(existingItem.shapeType)
                                            ? existingItem.shapeType
                                            : defaultFrameType,
                                };
                            } else {
                                throw new Error("Invalid frame update operation");
                            }
                            break;
                        }
                        case "Sticker":
                            updateOperation = {
                                itemType: "Sticker",
                                method: "setBackgroundColor",
                                backgroundColor: op.data.backgroundColor || existingItem.backgroundColor || "",
                            };
                            break;
                        case "RichText":
                            updateOperation = {
                                itemType: "RichText",
                                method: "edit",
                                ops: [
                                    {
                                        type: "text",
                                        path: [],
                                        text: op.data.text?.children[0]?.children[0]?.text || "",
                                    },
                                ],
                            };
                            break;
                        default:
                            throw new Error(`Unsupported item type: ${itemType}`);
                    }
                    await this._updateBoardItem({
                        boardId,
                        itemId: op.itemId,
                        userId: 0,
                        order,
                        operation: updateOperation,
                    });
                    break;
                case "delete":
                    if (!op.itemId) {
                        throw new HttpException(HttpStatus.BAD_REQUEST, "Invalid delete operation data");
                    }
                    await this._deleteBoardItem({
                        boardId,
                        itemId: op.itemId,
                        userId: 0,
                        order,
                    });
                    break;
            }
            order = await this.getAndIncrementOrder(boardId);
        }

        return this.getBoardItems(boardId);
    }

    async configureItemRefresh(
        boardId: string,
        itemId: string,
        config: { url: string; interval: number } | null
    ): Promise<BoardItem> {
        throw new Error("Not implemented");
    }

    private async invalidateBoardCache(boardId: string): Promise<void> {
        try {
            await this.redis.client.del(this.getBoardItemsKey(boardId));

            const itemPattern = this.getBoardItemKey(boardId, "*");
            const keys = await this.redis.client.keys(itemPattern);
            if (keys.length > 0) {
                await this.redis.client.del(...keys);
            }

            this.logger.info(`Invalidated Redis cache for board ${boardId}`);
        } catch (error) {
            this.logger.error(`Failed to invalidate Redis cache for board ${boardId}:`, error);
        }
    }

    async handleBoardSnapshot(boardId: string): Promise<void> {
        await this.invalidateBoardCache(boardId);
    }
}
