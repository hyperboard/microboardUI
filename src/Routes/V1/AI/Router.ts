import winston from "winston";
import express, { Request, Response } from "express";
import { AI } from "./AI";
import { catchAsync } from "shared/lib/catchAsync";
import { validateRequest } from "shared/utils/router";
import { body, param, query } from "express-validator";
import { internalError } from "shared/lib/routing";
import { db } from "drizzle/db";
import { chat, message } from "drizzle/entities";
import { eq, and } from "drizzle-orm";
import { HttpStatus } from "shared/enums/http-status.enum";

export function getAIRouter(ai: AI, logger: winston.Logger): express.Router {
    const router = express.Router();

    router.post(
        "/ai/generate",
        body("input").isString(),
        body("withContext").optional().isBoolean(),
        validateRequest,
        catchAsync(async (req: Request, res: Response) => {
            const response = await ai.generateSimpleChart(req.body.input);

            if (response) {
                return res.json({ message: response });
            }

            return internalError(res, null);
        })
    );

    // Get detailed chat with all messages
    router.get(
        "/ai/chats",
        query("boardId").isString(),
        validateRequest,
        catchAsync(async (req: Request, res: Response) => {
            const boardId = req.query.boardId as string;
            const verifiedChat = await ensureChatExist(boardId);

            const chatResult = await db
                .select({
                    id: chat.id,
                    createdAt: chat.createdAt,
                    active: chat.active,
                    boardId: chat.boardId,
                })
                .from(chat)
                .where(eq(chat.id, verifiedChat.id))
                .limit(1);

            if (chatResult.length === 0) {
                return res.status(HttpStatus.NOT_FOUND).json({ error: "Chat not found" });
            }

            const messages = await db
                .select({
                    id: message.id,
                    role: message.role,
                    content: message.content,
                    createdAt: message.createdAt,
                    tokensUsed: message.tokensUsed,
                })
                .from(message)
                .where(and(eq(message.chatId, verifiedChat.id), eq(message.archived, false)))
                .orderBy(message.createdAt);

            return res.json({
                ...chatResult[0],
                messages,
            });
        })
    );

    // Archive a message (soft delete)
    router.delete(
        "/ai/messages/:messageId",
        param("messageId").isInt(),
        validateRequest,
        catchAsync(async (req: Request, res: Response) => {
            const messageId = Number(req.params.messageId);

            await db.update(message).set({ archived: true }).where(eq(message.id, messageId));

            return res.status(HttpStatus.OK).json({ message: "Message archived successfully" });
        })
    );

    // Archive a chat (soft delete)
    // router.delete(
    //     "/ai/chats/:chatId",
    //     param("chatId").isInt(),
    //     validateRequest,
    //     catchAsync(async (req: Request, res: Response) => {
    //         const chatId = Number(req.params.chatId);

    //         await db.update(chat).set({ active: false }).where(eq(chat.id, chatId));
    //         // await db.update(message).set({ archived: true }).where(eq(message.chatId, chatId));

    //         return res.status(HttpStatus.OK).json({ message: "Chat archived successfully" });
    //     })
    // );

    // Health check endpoint
    router.get("/ai/", (req: Request, res: Response) => {
        return res.send("OK");
    });

    return router;
}

async function ensureChatExist(boardUUID: string) {
    const [foundChat] = await db.select().from(chat).where(eq(chat.boardId, boardUUID));

    if (!foundChat) {
        const [newChat] = await db.insert(chat).values({ boardId: boardUUID }).returning();

        return newChat;
    }

    return foundChat;
}
