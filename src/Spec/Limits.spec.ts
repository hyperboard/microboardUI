import dotenv from "dotenv";
import http from "http";
import request from "supertest";
import { beforeAll, afterAll, describe, it, expect } from "@jest/globals";
import { addUser, getUserByEmail } from "drizzle";
import { createToken } from "Tokens";
import { getApp } from "getApp";
import { db } from "drizzle/db";
import { userPlans, modelLimits, Plan, UserPlan } from "drizzle/entities/plans";
import { Chat, chat, message, MessageRole } from "drizzle/entities/ai";
import { eq, and, gte, lte, lt, inArray } from "drizzle-orm";
import { ChatStreamHandler, UsageLimitChecker } from "ai/openai/ChatStreamHandler";
import { AiChatMsg } from "WebSocket/ai-chat";
import { PLANS } from "drizzle/scripts/plans";
import { getCurrentUserPlan } from "Routes/V1/Billing/utils";
import { CryptoService } from "Routes/V1/Crypto/cryptoService";
import { StripeService } from "Routes/V1/Billing/stripe";

async function createTestUser() {
    await addUser("test@email.com", false);
    const user = await getUserByEmail("test@email.com");
    return user.userId;
}

async function createTestToken(testUserId: string, permissions: any) {
    return createToken(testUserId, 24 * 60 * 60, "Whiteboard", "Whiteboard", "access", permissions);
}

// class DummyWebSocket {
//     public messages: string[] = [];
//     send(message: string) {
//         this.messages.push(message);
//     }
// }

let server: http.Server;
let cryptoService: CryptoService;
let stripeService: StripeService;
let testUserId: number;
let boardId: string;
let token: string;
let chatStreamHandler: ChatStreamHandler;
let usageLimitChecker: UsageLimitChecker;
let currChat: Chat;
let currPlan: UserPlan;

beforeAll(async () => {
    dotenv.config();
    const app = await getApp();
    server = app.server;
    stripeService = app.stripeService;
    cryptoService = app.cryptoService;
    testUserId = await createTestUser();

    token = await createTestToken(testUserId + "", { owns: { catalogs: ["root"] } });
    const boardRes = await request(server)
        .post("/api/v2/boards")
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Test Board for Limits" })
        .expect(201);
    boardId = boardRes.body.id;

    chatStreamHandler = app.webSocket.chatStreamHandler;
    usageLimitChecker = chatStreamHandler.usageLimitChecker;

    await db
        .insert(userPlans)
        .values({
            id: crypto.randomUUID(),
            userId: testUserId,
            planId: "plus",
            startDate: new Date(),
            endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
            status: "active",
            transactionHash: "someHash",
        })
        .execute();
});

beforeEach(async () => {
    const boardChats = await db.select({ id: chat.id }).from(chat).where(eq(chat.boardId, boardId));
    const chatIds = boardChats.map((c) => c.id);
    if (chatIds.length > 0) {
        await db.delete(message).where(inArray(message.chatId, chatIds));
    }
    await db.delete(message).where(eq(message.chatId, currChat.id));
    await db.delete(userPlans).where(eq(userPlans.userId, testUserId));

    currChat = await chatStreamHandler.ensureChatExists({ boardId } as AiChatMsg);
    [currPlan] = await db
        .insert(userPlans)
        .values({
            id: crypto.randomUUID(),
            userId: testUserId,
            planId: "plus",
            startDate: new Date(),
            endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
            status: "active",
            transactionHash: "someHash",
        })
        .returning()
        .execute();
});

afterAll(() => {
    server.close();
});

describe("Integration tests for UsageLimitChecker", () => {
    describe("checkUserLimits (LLM)", () => {
        it("should allow saving a message when daily usage is below the limit", async () => {
            const resultBefore = await usageLimitChecker.checkUserLimits(testUserId, "gpt-4o-mini");
            expect(resultBefore.canProceed).toBe(true);

            await chatStreamHandler.saveMessage({
                chat: currChat,
                role: MessageRole.ASSISTANT,
                content: "someContent",
                model: "gpt-4o-mini",
            });

            const resultAfter = await usageLimitChecker.checkUserLimits(testUserId, "gpt-4o-mini");
            expect(resultAfter.canProceed).toBe(true);
        });

        it("should not allow saving a message when the daily usage limit is exceeded", async () => {
            const [existing] = await db
                .select({ dailyRequestLimit: modelLimits.dailyRequestLimit })
                .from(modelLimits)
                .where(and(eq(modelLimits.planId, currPlan.planId), eq(modelLimits.modelId, "gpt-4o-mini")))
                .execute();

            await db
                .update(modelLimits)
                .set({ dailyRequestLimit: 1 })
                .where(and(eq(modelLimits.planId, currPlan.planId), eq(modelLimits.modelId, "gpt-4o-mini")));

            await chatStreamHandler.saveMessage({
                chat: currChat,
                role: MessageRole.ASSISTANT,
                content: "someContent",
                model: "gpt-4o-mini",
            });

            const result = await usageLimitChecker.checkUserLimits(testUserId, "gpt-4o-mini");

            await db
                .update(modelLimits)
                .set({ dailyRequestLimit: existing.dailyRequestLimit })
                .where(and(eq(modelLimits.planId, currPlan.planId), eq(modelLimits.modelId, "gpt-4o-mini")));

            if (result.canProceed) throw new Error("Test failed: Expected request limit to be exceeded");
            expect(result.canProceed).toBe(false);
            expect(result.error).toBe("Request limit exceeded");
        });
    });

    describe("checkImageGenerationLimits", () => {
        it("should allow image generation when usage is below the limit", async () => {
            const resultBefore = await usageLimitChecker.checkImageGenerationLimits(testUserId);
            expect(resultBefore.canProceed).toBe(true);

            await chatStreamHandler.saveImageMessage({
                chat: currChat,
                role: MessageRole.ASSISTANT,
                imageUrl: "",
                model: "image-generation",
            });

            const resultAfter = await usageLimitChecker.checkImageGenerationLimits(testUserId);
            expect(resultAfter.canProceed).toBe(true);
        });

        it("should not allow image generation when the daily limit is exceeded", async () => {
            const [existing] = await db
                .select({ dailyRequestLimit: modelLimits.dailyRequestLimit })
                .from(modelLimits)
                .where(and(eq(modelLimits.planId, currPlan.planId), eq(modelLimits.modelId, "image-generation")))
                .execute();

            await db
                .update(modelLimits)
                .set({ dailyRequestLimit: 1 })
                .where(and(eq(modelLimits.planId, currPlan.planId), eq(modelLimits.modelId, "image-generation")));

            await chatStreamHandler.saveImageMessage({
                chat: currChat,
                role: MessageRole.ASSISTANT,
                imageUrl: "",
                model: "image-generation",
            });

            const result = await usageLimitChecker.checkImageGenerationLimits(testUserId);

            await db
                .update(modelLimits)
                .set({ dailyRequestLimit: existing.dailyRequestLimit })
                .where(and(eq(modelLimits.planId, currPlan.planId), eq(modelLimits.modelId, "image-generation")));

            if (result.canProceed) throw new Error("Test failed: Expected request limit to be exceeded");
            expect(result.canProceed).toBe(false);
            expect(result.error).toBe("Image generation limit exceeded");
        });
    });

    describe("checkAudioGenerationLimits", () => {
        it("should allow audio generation when under the symbol limit", async () => {
            const resultBefore = await usageLimitChecker.checkAudioGenerationLimits(testUserId, "Some text");
            expect(resultBefore.canProceed).toBe(true);

            await chatStreamHandler.saveAudioMessage({
                chat: currChat,
                model: "tts-1-hd",
                symbolsUsed: "Some text".length,
                role: MessageRole.ASSISTANT,
            });

            const resultAfter = await usageLimitChecker.checkAudioGenerationLimits(testUserId, "Some text");
            expect(resultAfter.canProceed).toBe(true);
        });

        it("should not allow audio generation when the symbol limit is exceeded", async () => {
            await chatStreamHandler.saveAudioMessage({
                chat: currChat,
                model: "tts-1-hd",
                symbolsUsed: PLANS[1].textToSpeech + 1,
                role: MessageRole.ASSISTANT,
            });

            const result = await usageLimitChecker.checkAudioGenerationLimits(testUserId, "Some text");
            if (result.canProceed) throw new Error("Test failed: Expected request limit to be exceeded");
            expect(result.canProceed).toBe(false);
            expect(result.error).toBe("Audio generation limit exceeded");
        });
    });

    describe("Expired plan tests for plus models", () => {
        it("should not allow plus models when the plan is expired", async () => {
            // Update the current plan end date to a past timestamp (expired)
            await db
                .update(userPlans)
                .set({ endDate: new Date(Date.now() - 1000) })
                .where(eq(userPlans.userId, testUserId));

            const resultLLM = await usageLimitChecker.checkUserLimits(testUserId, "gpt-4o");
            if (resultLLM.canProceed) throw new Error("Test failed: Expected request limit to be exceeded");
            expect(resultLLM.canProceed).toBe(false);
            expect(resultLLM.error).toBe("Model not available in your plan");

            const resultImage = await usageLimitChecker.checkImageGenerationLimits(testUserId);
            if (resultImage.canProceed) throw new Error("Test failed: Expected request limit to be exceeded");
            expect(resultImage.canProceed).toBe(false);
            expect(resultImage.error).toBe("Image generation not available in your plan");

            const resultAudio = await usageLimitChecker.checkAudioGenerationLimits(testUserId, "Some sample text");
            if (resultAudio.canProceed) throw new Error("Test failed: Expected request limit to be exceeded");
            expect(resultAudio.canProceed).toBe(false);
            expect(resultAudio.error).toBe("Audio generation not available in your plan");
        });

        it("should not allow plus models when the plan is expired, update the existing plan through crypto service", async () => {
            // Update the current plan end date to a past timestamp (expired)
            await db
                .update(userPlans)
                .set({ endDate: new Date(Date.now() - 1000) })
                .where(eq(userPlans.userId, testUserId));

            const resultLLM = await usageLimitChecker.checkUserLimits(testUserId, "gpt-4o");
            if (resultLLM.canProceed) throw new Error("Test failed: Expected request limit to be exceeded");
            expect(resultLLM.canProceed).toBe(false);
            expect(resultLLM.error).toBe("Model not available in your plan");

            const [dbPlan] = await db
                .select()
                .from(userPlans)
                .where(eq(userPlans.planId, currPlan.id))
                .limit(1)
                .execute();

            expect(dbPlan.status).toBe("expired");

            const updatedPlan = await getCurrentUserPlan(testUserId, stripeService, cryptoService);
            expect(updatedPlan.planId).toBe("basic");
        });
    });
});
