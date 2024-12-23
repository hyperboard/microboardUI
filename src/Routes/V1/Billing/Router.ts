import express from "express";
import { catchAsync } from "../../../shared/lib/catchAsync";
import { sql } from "drizzle-orm";
import winston from "winston";
import { db } from "../../../drizzle/db";
import { tariffTypes, tokenUsages } from "../../../drizzle/entities/tariffs";
import { eq, and } from "drizzle-orm";
import { jwtMiddleware } from "../../../Middlewares/jwt.middleware";

export const getBillingRouter = (logger: winston.Logger): express.Router => {
    const router = express.Router();

    async function getRemainingTokens(userId: number) {
        const currentUsage = await db
            .select({
                tokensUsed: tokenUsages.tokensUsed,
                monthlyTokenLimit: tariffTypes.monthlyTokenLimit,
                tariffName: tariffTypes.name,
                periodEnd: tokenUsages.periodEnd,
            })
            .from(tokenUsages)
            .innerJoin(tariffTypes, eq(tokenUsages.tariffTypeId, tariffTypes.id))
            .where(and(eq(tokenUsages.userId, userId), eq(tokenUsages.isCurrent, true)))
            .limit(1);

        if (!currentUsage.length) {
            throw new Error("No active tariff found for the user.");
        }

        const usage = currentUsage[0];
        if (usage.tokensUsed === null) {
            throw new Error("No token usage found for the user.");
        }
        const remainingTokens = usage.monthlyTokenLimit - usage.tokensUsed;

        return {
            remainingTokens,
            tariff: usage.tariffName,
            resetAt: usage.periodEnd,
        };
    }

    router.get(
        "/billing/tokens",
        jwtMiddleware(logger),
        catchAsync(async (req, res) => {
            const { token } = req;
            const userToken = await token;
            const userId = parseInt(userToken?.sub);
            const data = await getRemainingTokens(userId);
            res.json(data);
        })
    );

    router.get(
        "/billing/tariffs",
        jwtMiddleware(logger),
        catchAsync(async (req, res) => {
            const tariffs = await db.select().from(tariffTypes);
            res.json(tariffs);
        })
    );

    router.post(
        "/billing/subscribe",
        jwtMiddleware(logger),
        catchAsync(async (req, res) => {
            const { token } = req;
            const userToken = await token;
            const userId = parseInt(userToken?.sub);
            const { tariffId } = req.body;

            const tariff = await db.select().from(tariffTypes).where(eq(tariffTypes.id, tariffId)).limit(1);

            if (!tariff.length) {
                res.status(400).json({ error: "Invalid tariff ID." });
                return;
            }

            await db.transaction(async (trx) => {
                await trx.update(tokenUsages).set({ isCurrent: false }).where(eq(tokenUsages.userId, userId));

                const now = new Date();
                const resetPeriod = tariff[0].resetPeriodDays || 30;
                const periodEnd = new Date(now.getTime() + resetPeriod * 24 * 60 * 60 * 1000);

                await trx.insert(tokenUsages).values({
                    id: crypto.randomUUID(),
                    userId,
                    tariffTypeId: tariffId,
                    tokensUsed: 0,
                    periodStart: now,
                    periodEnd,
                    isCurrent: true,
                });
            });

            res.status(200).json({ message: "Successfully subscribed to tariff." });
        })
    );

    // FIXME: работает не так, разобраться
    router.post(
        "/billing/tokens/redeem",
        jwtMiddleware(logger),
        catchAsync(async (req, res) => {
            const { token } = req;
            const userToken = await token;
            const userId = parseInt(userToken?.sub);
            const { tokens } = req.body;

            const currentUsage = await db
                .select({
                    id: tokenUsages.id,
                    tokensUsed: tokenUsages.tokensUsed,
                    monthlyTokenLimit: tariffTypes.monthlyTokenLimit,
                })
                .from(tokenUsages)
                .innerJoin(tariffTypes, eq(tokenUsages.tariffTypeId, tariffTypes.id))
                .where(and(eq(tokenUsages.userId, userId), eq(tokenUsages.isCurrent, true)))
                .limit(1);

            if (!currentUsage.length) {
                res.status(400).json({ error: "No active tariff found." });
                return;
            }

            const usage = currentUsage[0];

            if (usage.tokensUsed + tokens > usage.monthlyTokenLimit) {
                res.status(400).json({ error: "Token limit exceeded." });
                return;
            }

            const currentUsed = currentUsage[0].tokensUsed;

            await db
                .update(tokenUsages)
                .set({ tokensUsed: sql`${tokenUsages.tokensUsed} + ${tokens}` })
                .where(eq(tokenUsages.id, usage.id));

            res.status(200).json({ message: "Tokens redeemed successfully." });
        })
    );

    return router;
};
