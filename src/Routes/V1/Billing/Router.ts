import express from "express";
import { catchAsync } from "../../../shared/lib/catchAsync";
import { sql } from "drizzle-orm";
import winston from "winston";
import { db } from "../../../drizzle/db";
import { aiModels, modelLimits, plans, userStorageUsage, userPlans } from "../../../drizzle/entities/plans";
import { eq, and, gte, lte } from "drizzle-orm";
import { jwtMiddleware } from "../../../Middlewares/jwt.middleware";
import { body } from "express-validator";
import { boardOwner, boards, chat, message } from "drizzle/entities";
import { createStripeService } from "./stripe";
import { Stripe } from "stripe";

export const getBillingRouter = (logger: winston.Logger, stripe: Stripe): express.Router => {
    const router = express.Router();
    const stripeService = createStripeService(stripe);

    function getCurrentPeriods() {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());

        return {
            daily: {
                start: startOfToday,
                end: now,
            },
            weekly: {
                start: startOfWeek,
                end: now,
            },
        };
    }

    async function getCurrentUserPlan(userId: number) {
        const now = new Date();
        const currentPlan = await db
            .select({
                planId: userPlans.planId,
                monthlyTokenLimit: plans.monthlyTokenLimit,
                name: plans.name,
                startDate: userPlans.startDate,
                endDate: userPlans.endDate,
                status: userPlans.status,
                storageLimit: plans.storageLimit,
            })
            .from(userPlans)
            .innerJoin(plans, eq(userPlans.planId, plans.id))
            .where(
                and(
                    eq(userPlans.userId, userId),
                    eq(userPlans.status, "active"),
                    lte(userPlans.startDate, now),
                    gte(userPlans.endDate, now)
                )
            )
            .limit(1);

        if (!currentPlan.length) {
            const freePlan = await db
                .select({
                    planId: plans.id,
                    monthlyTokenLimit: plans.monthlyTokenLimit,
                    name: plans.name,
                    storageLimit: plans.storageLimit,
                })
                .from(plans)
                .where(eq(plans.name, "free"))
                .limit(1);

            if (!freePlan.length) {
                throw new Error("Free plan not found in the system.");
            }

            const now = new Date();
            const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

            return {
                planId: freePlan[0].planId,
                monthlyTokenLimit: freePlan[0].monthlyTokenLimit,
                name: freePlan[0].name,
                startDate: now,
                endDate: thirtyDaysFromNow,
                status: "active" as const,
                storageLimit: freePlan[0].storageLimit,
            };
        }

        return currentPlan[0];
    }

    async function getCurrentModelLimits(userId: number) {
        const userPlan = await getCurrentUserPlan(userId);
        const modelLimitsQuery = await db
            .select({
                modelId: aiModels.id,
                modelName: aiModels.name,
                displayName: aiModels.displayName,
                isDefault: aiModels.isDefault,
                dailyLimit: modelLimits.dailyRequestLimit,
                weeklyLimit: modelLimits.weeklyRequestLimit,
                isEnabled: modelLimits.isEnabled,
            })
            .from(aiModels)
            .leftJoin(modelLimits, and(eq(modelLimits.modelId, aiModels.id), eq(modelLimits.planId, userPlan.planId)));

        const periods = getCurrentPeriods();
        const usage = await Promise.all(
            modelLimitsQuery.map(async (model) => {
                const [dailyUsage, weeklyUsage] = await Promise.all([
                    db
                        .select({
                            count: sql<number>`count(${message.id})`,
                        })
                        .from(message)
                        .innerJoin(chat, eq(message.chatId, chat.id))
                        .innerJoin(boards, sql`${chat.boardId}::text = ${boards.uniqId}::text`)
                        .innerJoin(boardOwner, eq(boards.id, boardOwner.boardId))
                        .where(
                            and(
                                eq(boardOwner.ownerId, userId),
                                eq(message.role, "assistant"),
                                gte(message.createdAt, periods.daily.start),
                                lte(message.createdAt, periods.daily.end)
                            )
                        ),
                    db
                        .select({
                            count: sql<number>`count(${message.id})`,
                        })
                        .from(message)
                        .innerJoin(chat, eq(message.chatId, chat.id))
                        .innerJoin(boards, sql`${chat.boardId}::text = ${boards.uniqId}::text`)
                        .innerJoin(boardOwner, eq(boards.id, boardOwner.boardId))
                        .where(
                            and(
                                eq(boardOwner.ownerId, userId),
                                eq(message.role, "assistant"),
                                gte(message.createdAt, periods.weekly.start),
                                lte(message.createdAt, periods.weekly.end)
                            )
                        ),
                ]);

                return {
                    ...model,
                    dailyUsage: dailyUsage[0].count,
                    weeklyUsage: weeklyUsage[0].count,
                };
            })
        );

        return usage;
    }

    async function getCurrentPeriodTokenUsage(userId: number, startDate: Date, endDate: Date) {
        const result = await db
            .select({
                totalTokens: sql<number>`COALESCE(SUM(${message.tokensUsed}), 0)`,
            })
            .from(message)
            .innerJoin(chat, eq(message.chatId, chat.id))
            .innerJoin(boards, sql`${chat.boardId}::text = ${boards.uniqId}::text`)
            .innerJoin(boardOwner, eq(boards.id, boardOwner.boardId))
            .where(
                and(eq(boardOwner.ownerId, userId), gte(message.createdAt, startDate), lte(message.createdAt, endDate))
            );

        return result[0].totalTokens;
    }

    async function getCurrentStorageUsage(userId: number) {
        const result = await db
            .select({
                totalBytes: userStorageUsage.totalBytes,
            })
            .from(userStorageUsage)
            .where(eq(userStorageUsage.userId, userId))
            .limit(1);

        return result.length ? result[0].totalBytes : 0;
    }

    router.get(
        "/billing/limits",
        jwtMiddleware(logger),
        catchAsync(async (req, res) => {
            const { token } = req;
            const userToken = await token;
            const userId = parseInt(userToken?.sub);

            const [currentPlan, modelLimits, storageUsage] = await Promise.all([
                getCurrentUserPlan(userId),
                getCurrentModelLimits(userId),
                getCurrentStorageUsage(userId),
            ]);

            const tokensUsed = await getCurrentPeriodTokenUsage(userId, currentPlan.startDate, currentPlan.endDate);

            const remainingTokens = currentPlan.monthlyTokenLimit - tokensUsed;

            res.json({
                tokens: {
                    remaining: remainingTokens,
                    used: tokensUsed,
                    limit: currentPlan.monthlyTokenLimit,
                },
                storage: {
                    used: storageUsage,
                    limit: currentPlan.storageLimit,
                },
                models: modelLimits.map((model) => ({
                    id: model.modelId,
                    name: model.modelName,
                    displayName: model.displayName,
                    isDefault: model.isDefault,
                    isEnabled: model.isEnabled,
                    limits: {
                        daily: model.dailyLimit,
                        weekly: model.weeklyLimit,
                        dailyUsed: model.dailyUsage,
                        weeklyUsed: model.weeklyUsage,
                    },
                })),
                plan: {
                    name: currentPlan.name,
                    periodStart: currentPlan.startDate,
                    periodEnd: currentPlan.endDate,
                },
            });
        })
    );

    router.get(
        "/billing/plans",
        jwtMiddleware(logger),
        catchAsync(async (req, res) => {
            const plansQuery = await db.select().from(plans).where(eq(plans.version, 1));
            res.json(plansQuery);
        })
    );

    //  // TEST
    // router.post(
    //     "/billing/subscribe",
    //     jwtMiddleware(logger),
    //     body("planId").isString(),
    //     catchAsync(async (req, res) => {
    //         const { token } = req;
    //         const userToken = await token;
    //         const userId = parseInt(userToken?.sub);
    //         const { planId } = req.body;

    //         const plan = await db.select().from(plans).where(eq(plans.id, planId)).limit(1);

    //         if (!plan.length) {
    //             res.status(400).json({ error: "Invalid plan ID." });
    //             return;
    //         }

    //         if (plan[0].name === "free") {
    //             res.status(400).json({ error: "Cannot subscribe to free plan." });
    //             return;
    //         }

    //         await db
    //             .update(userPlans)
    //             .set({
    //                 status: "cancelled",
    //                 canceledAt: new Date(),
    //             })
    //             .where(and(eq(userPlans.userId, userId), eq(userPlans.status, "active")));

    //         const now = new Date();
    //         const resetPeriod = plan[0].resetPeriodDays || 30;
    //         const endDate = new Date(now.getTime() + resetPeriod * 24 * 60 * 60 * 1000);

    //         await db.insert(userPlans).values({
    //             id: crypto.randomUUID(),
    //             userId,
    //             planId,
    //             startDate: now,
    //             endDate,
    //             status: "active",
    //         });

    //         res.status(200).json({ message: "Successfully subscribed to plan." });
    //     })
    // );

    router.post(
        "/billing/create-checkout",
        jwtMiddleware(logger),
        body("planId").isString(),
        body("successUrl").isString(),
        body("cancelUrl").isString(),
        catchAsync(async (req, res) => {
            const { token } = req;
            const userToken = await token;
            const userId = parseInt(userToken?.sub);
            const { planId, successUrl, cancelUrl } = req.body;

            const session = await stripeService.createCheckoutSession({
                userId,
                planId,
                successUrl,
                cancelUrl,
            });

            res.json({ url: session.url });
        })
    );

    return router;
};
