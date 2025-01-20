import { Queue, Worker } from "bullmq";
import { and, eq, lte } from "drizzle-orm";
import { db } from "drizzle/db";
import { users } from "drizzle/entities";
import { plans, userPlans } from "drizzle/entities/plans";
import { Redis } from "Redis";
import Stripe from "stripe";

interface CreateCheckoutSessionParams {
    userId: number;
    planId: string;
    successUrl: string;
    cancelUrl: string;
}

interface RenewalJobData {
    userId: number;
    planId: string;
    stripeSubscriptionId: string;
}

export interface StripeService {
    createCheckoutSession: (params: CreateCheckoutSessionParams) => Promise<Stripe.Checkout.Session>;
    handleWebhook: (event: Stripe.Event) => Promise<void>;
    handleSubscriptionRenewal: (stripeSubscriptionId: string) => Promise<void>;
    startSubscriptionCheck: (data: RenewalJobData) => Promise<void>;
    cleanup: () => Promise<void>;
    createStripeCustomer: (sub: string) => Promise<Stripe.Customer>;
    cancelSubscription: (userId: number) => Promise<void>;
    syncStripeDataToKV: (customerId: string) => Promise<any>;
}

const allowedEvents = [
    "checkout.session.completed",
    "customer.subscription.created",
    "customer.subscription.updated",
    "customer.subscription.deleted",
    "customer.subscription.paused",
    "customer.subscription.resumed",
    "customer.subscription.pending_update_applied",
    "customer.subscription.pending_update_expired",
    "customer.subscription.trial_will_end",
    "invoice.paid",
    "invoice.payment_failed",
    "invoice.payment_action_required",
    "invoice.upcoming",
    "invoice.marked_uncollectible",
    "invoice.payment_succeeded",
    "payment_intent.succeeded",
    "payment_intent.payment_failed",
    "payment_intent.canceled",
] as Stripe.Event.Type[];

export const createStripeService = (stripe: Stripe, redis: Redis): StripeService => {
    const subscriptionQueue = new Queue<RenewalJobData>("subscription-renewal", {
        connection: redis.client,
        defaultJobOptions: {
            attempts: 3,
            backoff: {
                type: "exponential",
                delay: 1000,
            },
        },
    });

    const scheduleSubscriptionCheck = async (data: RenewalJobData) => {
        await subscriptionQueue.add("check-subscriptions", data, {
            repeat: {
                pattern: "0 */6 * * *", // Run every 6 hours
            },
            jobId: `subscription-check-${data.userId}`,
        });
    };

    const scheduleFreePlanTransition = async (userId: number, transitionDate: Date) => {
        await subscriptionQueue.add(
            "transition-to-free",
            // @ts-ignore
            { userId },
            {
                delay: transitionDate.getTime() - Date.now(),
                jobId: `free-plan-transition-${userId}`,
            }
        );
    };

    const removeSubscriptionCheck = async (userId: number) => {
        const repeatableJobs = await subscriptionQueue.getJobSchedulers();
        const userJob = repeatableJobs.find((job) => job.id === `subscription-check-${userId}`);
        if (userJob) {
            await subscriptionQueue.removeJobScheduler(userJob.key);
        }
    };

    const worker = new Worker(
        "subscription-renewal",
        async (job) => {
            if (job.name === "check-subscriptions") {
                const { userId, planId, stripeSubscriptionId } = job.data;
                await handleSubscriptionCheck(userId, planId, stripeSubscriptionId);
            } else if (job.name === "transition-to-free") {
                const { userId } = job.data;
                await transitionToFreePlan(userId);
            }
        },
        { connection: redis.client }
    );

    worker.on("failed", (job, err) => {
        console.error(`Job failed: ${job?.name}`, err);
    });

    worker.on("completed", (job) => {
        console.log(`Job completed: ${job.name}`);
    });

    const handleSubscriptionCheck = async (userId: number, planId: string, stripeSubscriptionId: string) => {
        try {
            const stripeSubscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);

            const currentSubscription = await db
                .select()
                .from(userPlans)
                .where(
                    and(
                        eq(userPlans.userId, userId),
                        eq(userPlans.stripeSubscriptionId, stripeSubscriptionId),
                        eq(userPlans.status, "active")
                    )
                )
                .limit(1);

            if (!currentSubscription.length) return;

            if (stripeSubscription.status === "canceled" && new Date(currentSubscription[0].endDate) > new Date()) {
                await db
                    .update(userPlans)
                    .set({
                        status: "cancelled",
                        canceledAt: new Date(),
                    })
                    .where(eq(userPlans.id, currentSubscription[0].id));

                await scheduleFreePlanTransition(userId, new Date(currentSubscription[0].endDate));

                await removeSubscriptionCheck(userId);
                return;
            }

            if (stripeSubscription.status === "active") {
                const plan = await db.select().from(plans).where(eq(plans.id, planId)).limit(1);

                if (!plan.length) return;

                if (new Date(currentSubscription[0].endDate) <= new Date()) {
                    const startDate = new Date();
                    const endDate = new Date(
                        startDate.getTime() + (plan[0].resetPeriodDays || 30) * 24 * 60 * 60 * 1000
                    );

                    await db.transaction(async (tx) => {
                        await tx.insert(userPlans).values({
                            id: crypto.randomUUID(),
                            userId,
                            planId,
                            startDate,
                            endDate,
                            status: "active",
                            stripeSubscriptionId,
                        });

                        await tx
                            .update(userPlans)
                            .set({
                                status: "expired",
                                endDate: startDate,
                            })
                            .where(eq(userPlans.id, currentSubscription[0].id));
                    });

                    console.log(`[Recovery] Renewed subscription for user ${userId}`);
                }
            }
        } catch (error) {
            console.error(`Failed to process subscription for user ${userId}:`, error);
            throw error;
        }
    };

    const transitionToFreePlan = async (userId: number) => {
        const currentPlan = await db
            .select()
            .from(userPlans)
            .where(
                and(eq(userPlans.userId, userId), eq(userPlans.status, "cancelled"), lte(userPlans.endDate, new Date()))
            )
            .limit(1);

        if (!currentPlan.length) return;

        const freePlan = await db.select().from(plans).where(eq(plans.name, "free")).limit(1);

        if (!freePlan.length) throw new Error("Free plan not found");

        const startDate = new Date();
        const endDate = new Date(startDate.getTime() + (freePlan[0].resetPeriodDays || 30) * 24 * 60 * 60 * 1000);

        await db.insert(userPlans).values({
            id: crypto.randomUUID(),
            userId,
            planId: freePlan[0].id,
            startDate,
            endDate,
            status: "active",
        });
    };

    return {
        async syncStripeDataToKV(customerId: string) {
            const subscriptions = await stripe.subscriptions.list({
                customer: customerId,
                limit: 1,
                status: "all",
                expand: ["data.default_payment_method"],
            });

            if (subscriptions.data.length === 0) {
                const subData = { status: "none" };
                await redis.client.set(`stripe:customer:${customerId}`, JSON.stringify(subData));
                return subData;
            }

            const subscription = subscriptions.data[0];

            const subData = {
                subscriptionId: subscription.id,
                status: subscription.status,
                priceId: subscription.items.data[0].price.id,
                currentPeriodEnd: subscription.current_period_end,
                currentPeriodStart: subscription.current_period_start,
                cancelAtPeriodEnd: subscription.cancel_at_period_end,
                paymentMethod:
                    subscription.default_payment_method && typeof subscription.default_payment_method !== "string"
                        ? {
                              brand: subscription.default_payment_method.card?.brand ?? null,
                              last4: subscription.default_payment_method.card?.last4 ?? null,
                          }
                        : null,
            };

            await redis.client.set(`stripe:customer:${customerId}`, JSON.stringify(subData));
            return subData;
        },
        async createStripeCustomer(sub: string) {
            const [user] = await db
                .select()
                .from(users)
                .where(eq(users.id, +sub));

            if (!user) {
                throw new Error("Checkout error: No such user");
            }

            const stripeCustomer = await stripe.customers.create({
                email: user.email,
                metadata: { userId: +sub },
            });

            return stripeCustomer;
        },

        async createCheckoutSession({ userId, planId, successUrl, cancelUrl }: CreateCheckoutSessionParams) {
            const plan = await db.select().from(plans).where(eq(plans.id, planId)).limit(1);
            const userEmail = await db.select({ email: users.email }).from(users).where(eq(users.id, userId)).limit(1);

            if (!plan.length) {
                throw new Error("Plan not found");
            }

            const session = await stripe.checkout.sessions.create({
                customer_email: userEmail[0]?.email,
                line_items: [
                    {
                        price_data: {
                            currency: "rub",
                            product_data: {
                                name: plan[0].name,
                                description: plan[0].description || undefined,
                            },
                            unit_amount: plan[0].price,
                            recurring: {
                                interval: "month",
                            },
                        },
                        quantity: 1,
                    },
                ],
                mode: "subscription",
                success_url: successUrl,
                cancel_url: cancelUrl,
                metadata: {
                    userId: userId.toString(),
                    planId,
                },
            });

            return session;
        },

        async handleWebhook(event: Stripe.Event) {
            console.log(`[DEBUG] Stripe webhook event: ${event.type}`);
            if (!allowedEvents.includes(event.type)) return;
            const { customer: customerId } = event?.data?.object as {
                customer: string;
            };

            if (typeof customerId !== "string") {
                throw new Error(`[STRIPE HOOK][CANCER] ID isn't string.\nEvent type: ${event.type}`);
            }

            this.syncStripeDataToKV(customerId);

            switch (event.type) {
                case "checkout.session.completed": {
                    const session = event.data.object as Stripe.Checkout.Session;
                    const { userId, planId } = session.metadata!;

                    await db.transaction(async (tx) => {
                        await tx
                            .update(userPlans)
                            .set({ status: "cancelled", canceledAt: new Date() })
                            .where(and(eq(userPlans.userId, parseInt(userId)), eq(userPlans.status, "active")));

                        const plan = await tx.select().from(plans).where(eq(plans.id, planId)).limit(1);

                        if (!plan.length) throw new Error("Plan not found");

                        const now = new Date();
                        const endDate = new Date(now.getTime() + (plan[0].resetPeriodDays || 30) * 24 * 60 * 60 * 1000);

                        await tx.insert(userPlans).values({
                            id: crypto.randomUUID(),
                            userId: parseInt(userId),
                            planId,
                            startDate: now,
                            endDate,
                            status: "active",
                            stripeSubscriptionId: session.subscription as string,
                        });
                    });
                    break;
                }

                case "invoice.payment_succeeded": {
                    const invoice = event.data.object as Stripe.Invoice;

                    if (!invoice.subscription) return;

                    const currentSubscription = await db
                        .select()
                        .from(userPlans)
                        .where(eq(userPlans.stripeSubscriptionId, invoice.subscription as string))
                        .limit(1);

                    if (!currentSubscription.length) return;

                    const plan = await db
                        .select()
                        .from(plans)
                        .where(eq(plans.id, currentSubscription[0].planId))
                        .limit(1);

                    if (!plan.length) throw new Error("Plan not found");

                    const startDate = new Date();
                    const endDate = new Date(
                        startDate.getTime() + (plan[0].resetPeriodDays || 30) * 24 * 60 * 60 * 1000
                    );

                    await db.insert(userPlans).values({
                        id: crypto.randomUUID(),
                        userId: currentSubscription[0].userId,
                        planId: currentSubscription[0].planId,
                        startDate,
                        endDate,
                        status: "active",
                        stripeSubscriptionId: invoice.subscription as string,
                    });

                    await db
                        .update(userPlans)
                        .set({
                            status: "expired",
                            endDate: startDate,
                        })
                        .where(eq(userPlans.id, currentSubscription[0].id));

                    break;
                }

                case "invoice.payment_failed": {
                    const invoice = event.data.object as Stripe.Invoice;

                    if (!invoice.subscription) return;

                    await db
                        .update(userPlans)
                        .set({
                            status: "payment_failed",
                        })
                        .where(eq(userPlans.stripeSubscriptionId, invoice.subscription as string));

                    break;
                }

                case "customer.subscription.deleted": {
                    const subscription = event.data.object as Stripe.Subscription;
                    const userPlan = await db
                        .select()
                        .from(userPlans)
                        .where(and(eq(userPlans.stripeSubscriptionId, subscription.id), eq(userPlans.status, "active")))
                        .limit(1);

                    if (userPlan.length) {
                        await db
                            .update(userPlans)
                            .set({
                                status: "cancelled",
                                canceledAt: new Date(),
                            })
                            .where(eq(userPlans.id, userPlan[0].id));

                        await scheduleFreePlanTransition(userPlan[0].userId, new Date(userPlan[0].endDate));
                        await removeSubscriptionCheck(userPlan[0].userId);
                    }
                    break;
                }
            }
        },

        async handleSubscriptionRenewal(stripeSubscriptionId: string) {
            const currentSubscription = await db
                .select()
                .from(userPlans)
                .where(eq(userPlans.stripeSubscriptionId, stripeSubscriptionId))
                .limit(1);

            if (!currentSubscription.length) return;

            const plan = await db.select().from(plans).where(eq(plans.id, currentSubscription[0].planId)).limit(1);

            if (!plan.length) throw new Error("Plan not found");

            const startDate = new Date();
            const endDate = new Date(startDate.getTime() + (plan[0].resetPeriodDays || 30) * 24 * 60 * 60 * 1000);

            await db.transaction(async (tx) => {
                await tx.insert(userPlans).values({
                    id: crypto.randomUUID(),
                    userId: currentSubscription[0].userId,
                    planId: currentSubscription[0].planId,
                    startDate,
                    endDate,
                    status: "active",
                    stripeSubscriptionId,
                });

                await tx
                    .update(userPlans)
                    .set({
                        status: "expired",
                        endDate: startDate,
                    })
                    .where(eq(userPlans.id, currentSubscription[0].id));
            });
        },

        async cancelSubscription(userId: number) {
            try {
                const activeUserPlans = await db
                    .select()
                    .from(userPlans)
                    .where(and(eq(userPlans.userId, userId), eq(userPlans.status, "active")));

                if (!activeUserPlans.length) {
                    console.log(`No active subscriptions found for user ${userId}.`);
                    return;
                }

                for (const plan of activeUserPlans) {
                    if (plan.stripeSubscriptionId) {
                        await stripe.subscriptions.cancel(plan.stripeSubscriptionId);
                    } else {
                        console.warn(`No valid subscription ID for user ${userId} on plan ${plan.id}.`);
                    }
                }
            } catch (error) {
                console.error(`Failed to cancel subscriptions for user ${userId}:`, error);
            }
        },

        startSubscriptionCheck(data: RenewalJobData) {
            return scheduleSubscriptionCheck(data);
        },

        async cleanup() {
            await worker.close();
        },
    };
};
