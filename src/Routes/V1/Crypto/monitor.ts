import Web3 from "web3";
import { NewHeadsSubscription } from "web3/lib/commonjs/eth.exports";
import winston from "winston";
import { Job, Queue, Worker } from "bullmq";
import { db } from "drizzle/db";
import { and, eq, gt, gte, isNotNull, lte } from "drizzle-orm";
import { plans, userCryptoCheckout, userPlans } from "drizzle/entities/plans";
import { Redis } from "Redis";
import { catchAsync } from "shared/lib/catchAsync";
import { HttpStatus } from "shared/enums/http-status.enum";
import { Request, Response, NextFunction } from "express";

interface CryptoService {
    createCheckout: (req: Request, res: Response, next: NextFunction) => void;
    cancelCheckout: (req: Request, res: Response, next: NextFunction) => void;
    confirmCheckout: (req: Request, res: Response, next: NextFunction) => void;
    initSchedules: () => Promise<void>;
    cleanup: () => Promise<void>;
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

export const createCryptoService = (redis: Redis, logger: winston.Logger): CryptoService => {
    const ADDRESS_TO_MONITOR = process.env.SUBSCRIPTION_WALLET;
    const INFURA_API_KEY = process.env.INFURA_API_KEY;
    const COINMARKET_API_KEY = process.env.COINMARKET_API_KEY;

    if (!ADDRESS_TO_MONITOR || !INFURA_API_KEY || !COINMARKET_API_KEY) {
        throw new Error("web3: env is not set properly");
    }
    const COINMARKET_API_KEY_TYPE_GUARD = COINMARKET_API_KEY;
    const ADDRESS_TO_MONITOR_TYPE_GUARD = ADDRESS_TO_MONITOR;

    const mainnetURL = `wss://mainnet.infura.io/ws/v3/${INFURA_API_KEY}`;
    const sepoliaURL = `wss://sepolia.infura.io/ws/v3/${INFURA_API_KEY}`;
    const polygonURL = `wss://polygon-mainnet.infura.io/ws/v3/${INFURA_API_KEY}`;
    const arbitrumURL = `wss://arbitrum-mainnet.infura.io/ws/v3/${INFURA_API_KEY}`;

    // todo strictly type
    const chainURLMap: Record<string, string> = {
        polygon: polygonURL,
        "arbitrum one": arbitrumURL,
        ethereum: mainnetURL,
        sepolia: sepoliaURL,
    };
    const chainURLHttpMap: Record<string, string> = {
        polygon: `https://polygon-mainnet.infura.io/v3/${INFURA_API_KEY}`,
        "arbitrum one": `https://arbitrum-mainnet.infura.io/v3/${INFURA_API_KEY}`,
        ethereum: `https://mainnet.infura.io/v3/${INFURA_API_KEY}`,
        sepolia: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
    };

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

    const chainSubMap: Record<string, NewHeadsSubscription> = {};

    async function fetchRates(symbol: string, convert = "USD") {
        const url = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${symbol}&convert=${convert}`;
        const options = {
            method: "GET",
            headers: {
                accept: "application/json",
                "X-CMC_PRO_API_KEY": COINMARKET_API_KEY_TYPE_GUARD,
            },
        };

        const response = await fetch(url, options);
        const data = await response.json();
        return data.data;
    }

    async function verifyTransactionHash(
        hash: string,
        chain: string,
        expectedSender: string,
        expectedValue: string
    ): Promise<boolean> {
        const url = chainURLHttpMap[chain.toLowerCase()];
        const body = {
            jsonrpc: "2.0",
            method: "eth_getTransactionReceipt",
            params: [hash],
            id: 1,
        };

        let receipt = null;
        while (receipt === null) {
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            const data = await response.json();
            receipt = data.result;

            if (receipt === null) {
                await new Promise((resolve) => setTimeout(resolve, 5000));
            }
        }

        const txBody = {
            jsonrpc: "2.0",
            method: "eth_getTransactionByHash",
            params: [hash],
            id: 1,
        };
        const txResponse = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(txBody),
        });

        const txData = await txResponse.json();
        const transaction = txData.result;

        if (!transaction || !transaction.to || !transaction.from || !transaction.value) {
            return false;
        }

        const senderMatches = transaction.from.toLowerCase() === expectedSender.toLowerCase();
        const recieverMatches = transaction.to.toLowerCase() === ADDRESS_TO_MONITOR_TYPE_GUARD.toLocaleLowerCase();
        const valueMatches = parseInt(transaction.value, 16).toString() === expectedValue;

        return senderMatches && valueMatches && recieverMatches;
    }

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
                        tx.to.toLowerCase() === ADDRESS_TO_MONITOR_TYPE_GUARD.toLowerCase()
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
                            logger.info(
                                `web3: Found payed checkout ${
                                    sameHash.id
                                } with the same transaction hash ${tx.hash.toLowerCase()}`
                            );
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

                        unsubscribe(check.chainName);

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
                    }
                }
            }
        });

        subscription.on("error", (error) => {
            logger.error(`web3: ${net} subscription error: ${error}`);
        });

        return subscription;
    }

    async function createCheckoutDb(checkoutData: Omit<Checkout, "id">): Promise<Checkout & { id: string }> {
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

    const createCheckout = catchAsync(async (req, res) => {
        const { symbol, chain, sender, planId } = req.body;
        const providerURL = chainURLMap[chain.toLowerCase()];

        const { token } = req;
        const userToken = await token;
        const userId = parseInt(userToken?.sub);

        if (!providerURL) {
            return res
                .status(HttpStatus.BAD_REQUEST)
                .json({ error: `Unable to create checkout: unknown chain ${chain}, provider URL not found` });
        }

        const [active] = await db
            .select()
            .from(userPlans)
            .where(and(eq(userPlans.userId, userId), eq(userPlans.status, "active"), eq(userPlans.planId, planId)))
            .limit(1);

        if (active) {
            return res
                .status(HttpStatus.BAD_REQUEST)
                .json({ error: "Unable to create checkout: The selected plan is already active." });
        }

        const rates = await fetchRates(symbol.toString());
        const quote = rates[symbol.toString()]?.quote;
        if (!quote) {
            throw new Error("Failed to fetch rates");
        }

        const { price } = quote.USD;
        const web3 = new Web3();
        const PRICE = 12; // price of subscription in USD
        // const PRICE = 0.01; // price of subscription in USD
        const wei = web3.utils.toWei((PRICE / price).toString(), "ether");
        
        const check = await createCheckoutDb({
            userId,
            planId,
            symbol,
            addressFrom: sender.toLowerCase(),
            valueWei: wei,
            status: "active",
            chainName: chain.toLowerCase(),
        });

        logger.info(`web3: created checkout ${check.id} - ${PRICE / price} ${symbol}`);

        await createBlockListener(providerURL, chain);

        res.status(HttpStatus.OK).json({ price: wei, symbol, address: ADDRESS_TO_MONITOR });
    });

    const cancelCheckout = catchAsync(async (req, res) => {
        const { value, to, sender } = req.body;

        if (to !== ADDRESS_TO_MONITOR) {
            return res
                .status(HttpStatus.BAD_REQUEST)
                .json({ error: "Invalid address: 'to' address does not match the monitored address." });
        }

        const { token } = req;
        const userToken = await token;
        const userId = parseInt(userToken?.sub);

        const existingCheckout = await db
            .select()
            .from(userCryptoCheckout)
            .where(
                and(
                    eq(userCryptoCheckout.addressFrom, sender.toLowerCase()),
                    eq(userCryptoCheckout.valueWei, value),
                    eq(userCryptoCheckout.userId, userId)
                )
            )
            .limit(1);

        if (existingCheckout.length === 0) {
            return res.status(HttpStatus.NOT_FOUND).json({ error: "Checkout not found" });
        }

        const [deleted] = await db
            .update(userCryptoCheckout)
            .set({
                status: "cancelled",
            })
            .where(
                and(
                    eq(userCryptoCheckout.addressFrom, sender.toLowerCase()),
                    eq(userCryptoCheckout.valueWei, value),
                    eq(userCryptoCheckout.userId, userId)
                )
            )
            .returning();

        logger.info(`web3: canceled checkout ${deleted.id}`);

        unsubscribe(existingCheckout[0].chainName.toLowerCase());

        res.status(200).json({ message: "Checkout cancelled successfully" });
    });

    const confirmCheckout = catchAsync(async (req, res) => {
        const { token } = req;
        const userToken = await token;
        const userId = parseInt(userToken?.sub);
        const { planId, hash } = req.body;

        const [checkout] = await db
            .select()
            .from(userCryptoCheckout)
            .where(
                and(
                    eq(userCryptoCheckout.userId, userId),
                    eq(userCryptoCheckout.planId, planId),
                    eq(userCryptoCheckout.status, "active")
                )
            )
            .limit(1);

        if (!checkout) {
            return res.status(HttpStatus.NOT_FOUND).json({ error: "Checkout not found or already confirmed." });
        }

        const isValidTransaction = await verifyTransactionHash(
            hash,
            checkout.chainName,
            checkout.addressFrom,
            checkout.valueWei
        );

        if (!isValidTransaction) {
            return res.status(400).json({ error: "Transaction hash does not match the checkout details." });
        }

        const [confirmed] = await db
            .select()
            .from(userCryptoCheckout)
            .where(and(eq(userCryptoCheckout.transactionHash, hash), eq(userCryptoCheckout.status, "payed")));

        if (confirmed) {
            logger.info(`web3: checkout ${checkout.id} was already confirmed by ${hash}`);
            return res.status(HttpStatus.OK).json({ message: "Checkout confirmed successfully." });
        }

        await db
            .update(userCryptoCheckout)
            .set({
                status: "confirmed",
                transactionHash: hash,
            })
            .where(and(eq(userCryptoCheckout.userId, userId), eq(userCryptoCheckout.planId, planId)));

        logger.info(`web3: confirmed checkout ${checkout.id} by hash ${hash}`);
        unsubscribe(checkout.chainName);

        const plan = await db.select().from(plans).where(eq(plans.id, checkout.planId)).limit(1);
        if (!plan.length) throw new Error("Plan not found");

        await db
            .update(userPlans)
            .set({
                status: "cancelled",
                canceledAt: new Date(),
            })
            .where(and(eq(userPlans.userId, checkout.userId), eq(userPlans.status, "active")));

        const startDate = new Date();
        const endDate = new Date(startDate.getTime() + (plan[0].resetPeriodDays || 30) * 24 * 60 * 60 * 1000);

        await db.insert(userPlans).values({
            id: crypto.randomUUID(),
            userId: checkout.userId,
            planId: checkout.planId,
            startDate,
            endDate,
            status: "active",
            transactionHash: hash,
        });

        // Schedule plan expiry after one month
        await schedulePlanExpiry(checkout.userId, endDate);
        res.status(HttpStatus.OK).json({ message: "Checkout confirmed successfully." });
    });

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
        createCheckout,
        cancelCheckout,
        confirmCheckout,
        initSchedules,
        async cleanup() {
            await expiryWorker.close();
        },
    };
};
