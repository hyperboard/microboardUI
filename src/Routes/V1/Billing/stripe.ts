import { and, eq } from "drizzle-orm";
import { db } from "drizzle/db";
import { users } from "drizzle/entities";
import { plans, userPlans } from "drizzle/entities/plans";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_KEY!, {
    apiVersion: "2024-12-18.acacia",
});

interface CreateCheckoutSessionParams {
    userId: number;
    planId: string;
    successUrl: string;
    cancelUrl: string;
}

export const stripeService = {
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

            case "customer.subscription.deleted": {
                const subscription = event.data.object as Stripe.Subscription;

                await db
                    .update(userPlans)
                    .set({ status: "cancelled", canceledAt: new Date() })
                    .where(eq(userPlans.stripeSubscriptionId, subscription.id));
                break;
            }
        }
    },
};
