import Web3 from "web3";
import { NewHeadsSubscription } from "web3/lib/commonjs/eth.exports";
import winston from "winston";
import { Job, Queue, Worker } from "bullmq";
import { db } from "drizzle/db";
import { and, eq, gt, gte, isNotNull, lte } from "drizzle-orm";
import { plans, userCryptoCheckout, userPlans } from "drizzle/entities/plans";
import { Redis } from "Redis";

interface CryptoService {
    createBlockListener: (providerUrl: string, chain: string) => Promise<NewHeadsSubscription | null>;
    chainSubMap: Record<string, NewHeadsSubscription>;
    /** Creates checkout and schedules its expiry worker */
    createCheckout: (checkout: Omit<Checkout, "id">) => Promise<Checkout & { id: string }>;
    initSchedules: () => Promise<void>;
    cleanup: () => Promise<void>;
    unsubscribe: (chain: string) => Promise<void>;
}

type Checkout = {
    symbol: string;
    id: string;
    userId: number;
    planId: string;
    status: string;
    chainName: string;
    addressFrom: string;
    valueWei: string;
};

export const createCryptoService = (
    addressToMonitor: string,
    chainURLMap: Record<string, string>,
    redis: Redis,
    logger: winston.Logger
): CryptoService => {
    const chainSubMap: Record<string, NewHeadsSubscription> = {};

    async function unsubscribe(chain: string): Promise<void> {
        chain = chain.toLowerCase();
        const subscription = chainSubMap[chain];
        if (!subscription) {
            return;
        }

        const rest = await db
            .select()
            .from(userCryptoCheckout)
            .where(and(eq(userCryptoCheckout.chainName, chain), eq(userCryptoCheckout.status, "active")))
            .limit(1);

        if (!rest.length) {
            logger.info(`web3: No more active checkouts for chain ${chain}, unsubscribing.`);
            subscription.unsubscribe();
            delete chainSubMap[chain];
        }
    }

    const expiryQueue = new Queue("expiry", {
        connection: redis.client,
        defaultJobOptions: {
            attempts: 3,
            backoff: {
                type: "exponential",
                delay: 1000,
            },
        },
    });

    const expiryWorker = new Worker(
        "expiry",
        async (job: Job) => {
            switch (job.name) {
                case "checkout-expiry":
                    await handleCheckoutExpiry(job);
                    break;
                case "plan-expiry":
                    await handlePlanExpiry(job);
                    break;
                default:
                    throw new Error(`Unknown job type: ${job.name}`);
            }
        },
        { connection: redis.client }
    );

    async function handleCheckoutExpiry(job: Job) {
        const { checkoutId } = job.data;
        const [checkout] = await db
            .select()
            .from(userCryptoCheckout)
            .where(
                and(
                    eq(userCryptoCheckout.id, checkoutId),
                    eq(userCryptoCheckout.status, "active"),
                    lte(userCryptoCheckout.endDate, new Date())
                )
            )
            .limit(1);

        if (checkout) {
            const chain = checkout.chainName.toLowerCase();

            await db.update(userCryptoCheckout).set({ status: "expired" }).where(eq(userCryptoCheckout.id, checkoutId));

            unsubscribe(chain);
        }
    }

    async function handlePlanExpiry(job: Job) {
        const { userId } = job.data;
        const [currentPlan] = await db
            .select()
            .from(userPlans)
            .where(
                and(
                    eq(userPlans.userId, userId),
                    eq(userPlans.status, "active"),
                    lte(userPlans.endDate, new Date()),
                    isNotNull(userPlans.transactionHash)
                )
            )
            .limit(1);

        if (currentPlan) {
            await db.update(userPlans).set({ status: "expired" }).where(eq(userPlans.id, currentPlan.id));

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
        }
    }

    async function scheduleCheckoutExpiry(checkoutId: string, endDate: Date) {
        await scheduleExpiry("checkout-expiry", { checkoutId }, endDate);
    }
    async function schedulePlanExpiry(userId: number, endDate: Date) {
        await scheduleExpiry("plan-expiry", { userId }, endDate);
    }

    async function scheduleExpiry(name: string, data: any, endDate: Date) {
        const delay = endDate.getTime() - Date.now();
        const safeDelay = delay > 0 ? delay : 0;

        await expiryQueue.add(name, { ...data }, { delay: safeDelay });
    }

    async function createBlockListener(providerUrl: string, chain: string): Promise<NewHeadsSubscription | null> {
        chain = chain.toLowerCase();
        if (!providerUrl.startsWith("wss://")) {
            logger.error(`web3: The provider URL ${providerUrl} is not a WebSocket Secure URL.`);
            return null;
        }

        if (chainSubMap[chain]) {
            return null;
        }

        const web3Instance = new Web3(providerUrl);
        const net = providerUrl.split("//")[1].split("/")[0];
        logger.info(`web3: Subscribing to ${net}.`);

        const subscription = await web3Instance.eth.subscribe("newBlockHeaders");
        chainSubMap[chain] = subscription;

        subscription.on("connected", (subscriptionId) => {
            logger.info(`web3: subscription connected (${net} - ${subscriptionId})`);
        });

        subscription.on("data", async (blockHeader) => {
            const block = await web3Instance.eth.getBlock(blockHeader.hash, true);
            if (block && block.transactions) {
                for (const tx of block.transactions) {
                    if (
                        typeof tx === "object" &&
                        tx.value &&
                        tx.to &&
                        tx.to.toLowerCase() === addressToMonitor.toLowerCase()
                    ) {
                        const [sameHash] = await db
                            .select()
                            .from(userCryptoCheckout)
                            .where(
                                and(
                                    eq(userCryptoCheckout.transactionHash, tx.hash.toLowerCase()),
                                    eq(userCryptoCheckout.status, "payed")
                                )
                            )
                            .limit(1);

                        if (sameHash) {
                            // was confirmed by hash
                            // logger.warn(`Found payed checkout with the same transaction hash ${tx.hash.toLowerCase()}`);
                            unsubscribe(sameHash.chainName);
                            return;
                        }

                        const [check] = await db
                            .select()
                            .from(userCryptoCheckout)
                            .where(
                                and(
                                    eq(userCryptoCheckout.chainName, chain.toLowerCase()),
                                    eq(userCryptoCheckout.addressFrom, tx.from.toLowerCase()),
                                    eq(userCryptoCheckout.valueWei, tx.value.toString()),
                                    eq(userCryptoCheckout.status, "active")
                                )
                            );

                        if (!check) throw new Error("check not found");

                        logger.info(`web3: payed check ${check.id}, hash ${tx.hash.toLowerCase()}`);

                        await db
                            .update(userCryptoCheckout)
                            .set({ status: "payed", transactionHash: tx.hash.toLowerCase() })
                            .where(eq(userCryptoCheckout.id, check.id));

                        const plan = await db.select().from(plans).where(eq(plans.id, check.planId)).limit(1);
                        if (!plan.length) throw new Error("Plan not found");

                        await db
                            .update(userPlans)
                            .set({
                                status: "cancelled",
                                canceledAt: new Date(),
                            })
                            .where(and(eq(userPlans.userId, check.userId), eq(userPlans.status, "active")));

                        const startDate = new Date();
                        const endDate = new Date(
                            startDate.getTime() + (plan[0].resetPeriodDays || 30) * 24 * 60 * 60 * 1000
                        );

                        await db.insert(userPlans).values({
                            id: crypto.randomUUID(),
                            userId: check.userId,
                            planId: check.planId,
                            startDate,
                            endDate,
                            status: "active",
                            transactionHash: tx.hash,
                        });

                        // Schedule plan expiry after one month
                        await schedulePlanExpiry(check.userId, endDate);

                        unsubscribe(check.chainName);
                    }
                }
            }
        });

        subscription.on("error", (error) => {
            logger.error(`web3: ${net} subscription error: ${error}`);
        });

        return subscription;
    }

    async function createCheckout(checkoutData: Omit<Checkout, "id">): Promise<Checkout & { id: string }> {
        const { userId, planId, symbol, valueWei, chainName, addressFrom } = checkoutData;
        const checkoutId = crypto.randomUUID();
        const startDate = new Date();
        const endDate = new Date(startDate.getTime() + 15 * 60 * 1000); // 15 minutes later
        const [checkout] = await db
            .insert(userCryptoCheckout)
            .values({
                id: checkoutId,
                userId,
                planId,
                symbol,
                addressFrom: addressFrom.toLowerCase(),
                valueWei,
                status: "active",
                chainName: chainName.toLowerCase(),
                startDate,
                endDate,
            })
            .returning();

        await scheduleCheckoutExpiry(checkoutId, endDate);

        return checkout;
    }

    async function initSchedules() {
        logger.info("web3: Initializing schedules for active checkouts and user plans.");
        const now = new Date();

        const futureCheckouts = await db
            .select()
            .from(userCryptoCheckout)
            .where(and(eq(userCryptoCheckout.status, "active"), gt(userCryptoCheckout.endDate, now)));
        for (const checkout of futureCheckouts) {
            await scheduleCheckoutExpiry(checkout.id, checkout.endDate);
            await createBlockListener(chainURLMap[checkout.chainName], checkout.chainName);
        }

        const expiredCheckouts = await db
            .select()
            .from(userCryptoCheckout)
            .where(and(eq(userCryptoCheckout.status, "active"), lte(userCryptoCheckout.endDate, now)));
        for (const checkout of expiredCheckouts) {
            await scheduleCheckoutExpiry(checkout.id, now);
        }

        const futurePlans = await db
            .select()
            .from(userPlans)
            .where(
                and(eq(userPlans.status, "active"), isNotNull(userPlans.transactionHash), gt(userPlans.endDate, now))
            );
        for (const plan of futurePlans) {
            await schedulePlanExpiry(plan.userId, plan.endDate);
        }

        const expiredPlans = await db
            .select()
            .from(userPlans)
            .where(
                and(eq(userPlans.status, "active"), isNotNull(userPlans.transactionHash), lte(userPlans.endDate, now))
            );
        for (const plan of expiredPlans) {
            await schedulePlanExpiry(plan.userId, now);
        }
    }

    initSchedules();
    return {
        createBlockListener,
        createCheckout,
        unsubscribe,
        initSchedules,
        chainSubMap,
        async cleanup() {
            await expiryWorker.close();
        },
    };
};
