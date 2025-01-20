import express from "express";
import { catchAsync } from "../../../shared/lib/catchAsync";
import { desc, eq, and } from "drizzle-orm";
import winston from "winston";
import { db } from "../../../drizzle/db";
import { plans, userPlans } from "../../../drizzle/entities/plans";
import { jwtMiddleware } from "../../../Middlewares/jwt.middleware";
import { body } from "express-validator";
import { StripeService } from "./stripe";
import { Redis } from "Redis";
import {
    getCurrentModelLimits,
    getCurrentPeriods,
    getCurrentPeriodTokenUsage,
    getCurrentStorageUsage,
    getCurrentUserPlan,
} from "./utils";
import { HttpStatus } from "shared/enums/http-status.enum";

export const getBillingRouter = (
    logger: winston.Logger,
    stripeService: StripeService,
    redis: Redis
): express.Router => {
    const router = express.Router();

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

            const periods = getCurrentPeriods();

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
                        daily: {
                            limit: model.dailyLimit,
                            used: model.dailyUsage,
                            remaining: model.dailyLimit ? Math.max(0, model.dailyLimit - model.dailyUsage) : null,
                            resetDate: periods.daily.resetDate,
                        },
                        weekly: {
                            limit: model.weeklyLimit,
                            used: model.weeklyUsage,
                            remaining: model.weeklyLimit ? Math.max(0, model.weeklyLimit - model.weeklyUsage) : null,
                            resetDate: periods.weekly.resetDate,
                        },
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

    router.delete(
        "/billing/cancel",
        jwtMiddleware(logger),
        catchAsync(async (req, res) => {
            const userId = +req.token.sub;
            await stripeService.cancelSubscription(userId);
            res.status(HttpStatus.NO_CONTENT).json(userId);
        })
    );

    router.get(
        "/billing/history",
        jwtMiddleware(logger),
        catchAsync(async (req, res) => {
            const { token } = req;
            const userToken = await token;
            const userId = parseInt(userToken?.sub);

            const history = await db
                .select({
                    id: userPlans.id,
                    planId: userPlans.planId,
                    planName: plans.name,
                    startDate: userPlans.startDate,
                    endDate: userPlans.endDate,
                    status: userPlans.status,
                    canceledAt: userPlans.canceledAt,
                    price: plans.price,
                    description: plans.description,
                    monthlyTokenLimit: plans.monthlyTokenLimit,
                    storageLimit: plans.storageLimit,
                })
                .from(userPlans)
                .innerJoin(plans, eq(userPlans.planId, plans.id))
                .where(eq(userPlans.userId, userId))
                .orderBy(desc(userPlans.startDate));

            res.json(history);
        })
    );

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

            let stripeCustomerId = await redis.client.get(`stripe:user:${userToken.sub}`);

            if (!stripeCustomerId) {
                stripeCustomerId = (await stripeService.createStripeCustomer(userToken.sub)).id;
            }

            const session = await stripeService.createCheckoutSession({
                userId,
                planId,
                successUrl,
                cancelUrl,
            });

            res.json({ url: session.url });
        })
    );

    router.get(
        "/billing/sync-after-success",
        jwtMiddleware(logger),
        catchAsync(async (req, res) => {
            const userToken = await req.token;
            let stripeCustomerId = await redis.client.get(`stripe:user:${userToken.sub}`);
            if (!stripeCustomerId) {
                return res.status(404).json({ message: "Subscriber not found" });
            }
            await stripeService.syncStripeDataToKV(stripeCustomerId);
            return res.status(200).json({
                message: "Subscriber verified",
            });
        })
    );
    router.delete(
        "/billing/subscriptions",
        jwtMiddleware(logger),
        catchAsync(async (req, res) => {
            const userToken = await req.token;
            const userId = +userToken.sub;

            const activeSubscription = await db
                .select()
                .from(userPlans)
                .where(and(eq(userPlans.userId, userId), eq(userPlans.status, "active")))
                .limit(1);

            if (!activeSubscription.length) {
                return res.status(404).json({
                    error: "No active subscription found",
                });
            }

            const subscription = activeSubscription[0];

            if (!subscription.stripeSubscriptionId) {
                return res.status(400).json({
                    error: "No Stripe subscription found",
                });
            }

            try {
                await stripeService.stripe.subscriptions.update(subscription.stripeSubscriptionId, {
                    cancel_at_period_end: true,
                });

                await db
                    .update(userPlans)
                    .set({
                        status: "pending_cancellation",
                        canceledAt: new Date(),
                    })
                    .where(eq(userPlans.id, subscription.id));

                return res.status(200).json({
                    message: "Subscription will be canceled at the end of the billing period",
                });
            } catch (error) {
                logger.error("Failed to cancel subscription:", error);
                return res.status(500).json({
                    error: "Failed to cancel subscription",
                });
            }
        })
    );

    // change plan
    router.patch(
        "/billing/subscriptions",
        jwtMiddleware(logger),
        body("newPlanId").isString(),
        body("productId").isString(),
        catchAsync(async (req, res) => {
            const userToken = await req.token;
            const userId = +userToken.sub;

            const { newPlanId } = req.body as { newPlanId: string };

            const activeSubscription = await db
                .select()
                .from(userPlans)
                .where(and(eq(userPlans.userId, userId), eq(userPlans.status, "active")))
                .limit(1);

            if (!activeSubscription.length) {
                return res.status(404).json({
                    error: "No active subscription found",
                });
            }

            const subscription = activeSubscription[0];

            if (!subscription.stripeSubscriptionId) {
                return res.status(400).json({
                    error: "No Stripe subscription found",
                });
            }

            try {
                const plan = await db.select().from(plans).where(eq(plans.id, newPlanId)).limit(1);

                if (!plan.length) {
                    return res.status(404).json({
                        error: "New plan not found",
                    });
                }

                const stripeSubscription = await stripeService.stripe.subscriptions.retrieve(
                    subscription.stripeSubscriptionId
                );

                await stripeService.stripe.subscriptions.update(subscription.stripeSubscriptionId, {
                    items: [
                        {
                            id: stripeSubscription.items.data[0].id,
                            price_data: {
                                currency: "rub",
                                product: "",
                                unit_amount: plan[0].price,
                                recurring: {
                                    interval: "month",
                                },
                            },
                        },
                    ],
                    metadata: {
                        ...stripeSubscription.metadata,
                        planId: newPlanId,
                    },
                });

                await db
                    .update(userPlans)
                    .set({
                        planId: newPlanId,
                        updatedAt: new Date(),
                    })
                    .where(eq(userPlans.id, subscription.id));

                return res.status(200).json({
                    message: "Subscription plan updated successfully",
                });
            } catch (error) {
                logger.error("Failed to change subscription plan:", error);
                return res.status(500).json({
                    error: "Failed to update subscription plan",
                });
            }
        })
    );

    // Заявка на кастом
    // router.post(
    //     "/billing/custom",
    //     jwtMiddleware(logger),
    //     catchAsync(async (req, res) => {
    //         const userToken = await req.token;
    //         const userId = +userToken.sub;

    //         const [pendingRequest] = await db
    //             .select()
    //             .from(customPlanRequests)
    //             .where(eq(customPlanRequests.userId, userId))
    //             .limit(1);

    //         if (pendingRequest) {
    //             return res.status(409).json({
    //                 error: "You already have a pending request",
    //             });
    //         }

    //         const [newRequest] = await db
    //             .insert(customPlanRequests)
    //             .values({ userId: userId, status: "pending" })
    //             .returning();

    //         return res.send(201).json(newRequest);
    //     })
    // );

    return router;
};
