import express from "express";
import { catchAsync } from "../../../shared/lib/catchAsync";
import { sql } from "drizzle-orm";
import winston from "winston";
import { db } from "../../../drizzle/db";
import { tariffPlans, userTariffs } from "../../../drizzle/entities/tariffs";
import { eq, and, gte, lte } from "drizzle-orm";
import { jwtMiddleware } from "../../../Middlewares/jwt.middleware";
import { body } from "express-validator";
import { boardOwner, boards, chat, message } from "drizzle/entities";

export const getBillingRouter = (logger: winston.Logger): express.Router => {
    const router = express.Router();

    function getCurrentMonthPeriod() {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return {
            startDate: startOfMonth,
            endDate: now,
        };
    }

    async function getCurrentUserTariff(userId: number) {
        const now = new Date();
        const currentTariff = await db
            .select({
                tariffId: userTariffs.tariffId,
                monthlyTokenLimit: tariffPlans.monthlyTokenLimit,
                tariffName: tariffPlans.name,
                startDate: userTariffs.startDate,
                endDate: userTariffs.endDate,
                status: userTariffs.status,
            })
            .from(userTariffs)
            .innerJoin(tariffPlans, eq(userTariffs.tariffId, tariffPlans.id))
            .where(
                and(
                    eq(userTariffs.userId, userId),
                    eq(userTariffs.status, "active"),
                    lte(userTariffs.startDate, now),
                    gte(userTariffs.endDate, now)
                )
            )
            .limit(1);

        if (!currentTariff.length) {
            const freeTariff = await db
                .select({
                    tariffId: tariffPlans.id,
                    monthlyTokenLimit: tariffPlans.monthlyTokenLimit,
                    tariffName: tariffPlans.name,
                })
                .from(tariffPlans)
                .where(eq(tariffPlans.name, "free"))
                .limit(1);

            if (!freeTariff.length) {
                throw new Error("Free tariff not found in the system.");
            }

            const { startDate, endDate } = getCurrentMonthPeriod();

            return {
                tariffId: freeTariff[0].tariffId,
                monthlyTokenLimit: freeTariff[0].monthlyTokenLimit,
                tariffName: freeTariff[0].tariffName,
                startDate,
                endDate,
                status: "active" as const,
            };
        }

        return currentTariff[0];
    }

    async function getCurrentPeriodTokenUsage(userId: number, startDate: Date, endDate: Date) {
        const result = await db
            .select({
                totalTokens: sql<number>`COALESCE(SUM(${message.tokensUsed}), 0)`,
            })
            .from(message)
            .innerJoin(chat, eq(message.chatId, chat.id))
            .innerJoin(
                boards,
                sql`${chat.boardId}::text = ${boards.uniqId}::text` // Cast both to text for comparison
            )
            .innerJoin(boardOwner, eq(boards.id, boardOwner.boardId))
            .where(
                and(eq(boardOwner.ownerId, userId), gte(message.createdAt, startDate), lte(message.createdAt, endDate))
            );

        return result[0].totalTokens;
    }

    router.get(
        "/billing/tokens",
        jwtMiddleware(logger),
        catchAsync(async (req, res) => {
            const { token } = req;
            const userToken = await token;
            const userId = parseInt(userToken?.sub);

            const currentTariff = await getCurrentUserTariff(userId);
            const tokensUsed = await getCurrentPeriodTokenUsage(userId, currentTariff.startDate, currentTariff.endDate);

            const remainingTokens = currentTariff.monthlyTokenLimit - tokensUsed;

            res.json({
                remainingTokens,
                tariff: currentTariff.tariffName,
                resetAt: currentTariff.endDate,
                tokensUsed,
                limit: currentTariff.monthlyTokenLimit,
                periodStart: currentTariff.startDate,
                periodEnd: currentTariff.endDate,
            });
        })
    );

    router.get(
        "/billing/tariffs",
        jwtMiddleware(logger),
        catchAsync(async (req, res) => {
            const tariffs = await db.select().from(tariffPlans).where(eq(tariffPlans.version, 1));
            res.json(tariffs);
        })
    );

    router.post(
        "/billing/subscribe",
        jwtMiddleware(logger),
        body("tariffId").isString(),
        catchAsync(async (req, res) => {
            const { token } = req;
            const userToken = await token;
            const userId = parseInt(userToken?.sub);
            const { tariffId } = req.body;

            const tariff = await db.select().from(tariffPlans).where(eq(tariffPlans.id, tariffId)).limit(1);

            if (!tariff.length) {
                res.status(400).json({ error: "Invalid tariff ID." });
                return;
            }

            if (tariff[0].name === "free") {
                res.status(400).json({ error: "Cannot subscribe to free tariff." });
                return;
            }

            await db
                .update(userTariffs)
                .set({
                    status: "cancelled",
                    canceledAt: new Date(),
                })
                .where(and(eq(userTariffs.userId, userId), eq(userTariffs.status, "active")));
            const now = new Date();
            const resetPeriod = tariff[0].resetPeriodDays || 30;
            const endDate = new Date(now.getTime() + resetPeriod * 24 * 60 * 60 * 1000);

            await db.insert(userTariffs).values({
                id: crypto.randomUUID(),
                userId,
                tariffId,
                startDate: now,
                endDate,
                status: "active",
            });

            res.status(200).json({ message: "Successfully subscribed to tariff." });
        })
    );

    return router;
};
