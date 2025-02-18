import Web3 from "web3";
import winston from "winston";
import { Job, Queue, Worker } from "bullmq";
import { db } from "drizzle/db";
import { and, eq, gt, gte, isNotNull, lte } from "drizzle-orm";
import { plans, userCryptoCheckout, userPlans, walletLastCheckedBlock } from "drizzle/entities/plans";
import { Redis } from "Redis";
import { catchAsync } from "shared/lib/catchAsync";
import { HttpStatus } from "shared/enums/http-status.enum";
import { Request, Response, NextFunction } from "express";
import { HttpException } from "shared/exceptions/http-exception";
import { USD } from "drizzle/scripts/plans";

export interface CryptoService {
    createCheckout: (req: Request, res: Response, next: NextFunction) => void;
    cancelCheckout: (req: Request, res: Response, next: NextFunction) => void;
    confirmCheckout: (req: Request, res: Response, next: NextFunction) => void;
    handlePlanExpiry(userId: number): void;
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
    annualPayment: boolean;
};

const CHAINS = ["ethereum", "polygon", "arbitrum one"] as const;
type Chain = typeof CHAINS[number];

function isValidChain(chain: any): chain is Chain {
    return CHAINS.includes(chain);
}

export const createCryptoService = (redis: Redis, logger: winston.Logger): CryptoService => {
    const ADDRESS_TO_MONITOR = process.env.SUBSCRIPTION_WALLET;
    const COINMARKET_API_KEY = process.env.COINMARKET_API_KEY;
    const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
    const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY;
    const ARBISCAN_API_KEY = process.env.ARBISCAN_API_KEY;

    if (!ADDRESS_TO_MONITOR || !COINMARKET_API_KEY || !ETHERSCAN_API_KEY || !POLYGONSCAN_API_KEY || !ARBISCAN_API_KEY) {
        throw new Error("web3: env is not set properly");
    }
    const COINMARKET_API_KEY_TYPE_GUARD = COINMARKET_API_KEY;
    const ADDRESS_TO_MONITOR_TYPE_GUARD = ADDRESS_TO_MONITOR;

    const chainExplorerMap: Record<
        Chain,
        { baseUrl: string; apiKey: string; delayMS: number; interval?: NodeJS.Timeout }
    > = {
        ethereum: {
            baseUrl: "https://api.etherscan.io/api",
            apiKey: ETHERSCAN_API_KEY,
            delayMS: 12_000,
        },
        polygon: {
            baseUrl: "https://api.polygonscan.com/api",
            apiKey: POLYGONSCAN_API_KEY,
            delayMS: 2_000,
        },
        "arbitrum one": {
            baseUrl: "https://api.arbiscan.io/api",
            apiKey: ARBISCAN_API_KEY,
            delayMS: 1_000,
        },
    };

    async function startIntervalForChain(chain: Chain): Promise<void> {
        if (chainExplorerMap[chain].interval) {
            return;
        }
        logger.info(`web3: Starting interval polling for chain: ${chain}`);

        chainExplorerMap[chain].interval = setInterval(async () => {
            try {
                await checkAllTransactionsForChain(chain);
            } catch (err) {
                logger.error(`Error in interval polling for ${chain}: ${String(err)}`);
            }
        }, chainExplorerMap[chain].delayMS);
    }

    function stopIntervalForChain(chain: Chain): void {
        if (chainExplorerMap[chain].interval) {
            clearInterval(chainExplorerMap[chain].interval);
            delete chainExplorerMap[chain].interval;
            logger.info(`web3: No more active checkouts for chain ${chain}, stopped interval.`);
        }
    }

    async function fetchNativeTransactions(walletAddress: string, chain: Chain): Promise<Array<any>> {
        const [lastCheckedBlock] = await db
            .select()
            .from(walletLastCheckedBlock)
            .where(
                and(
                    eq(walletLastCheckedBlock.address, walletAddress.toLowerCase()),
                    eq(walletLastCheckedBlock.chainName, chain)
                )
            )
            .execute();

        if (!lastCheckedBlock) {
            await db
                .insert(walletLastCheckedBlock)
                .values({
                    address: walletAddress.toLowerCase(),
                    chainName: chain,
                    id: crypto.randomUUID(),
                })
                .execute();
        }

        const { baseUrl, apiKey } = chainExplorerMap[chain];
        const url = new URL(baseUrl);
        url.searchParams.append("module", "account");
        url.searchParams.append("action", "txlist");
        url.searchParams.append("address", walletAddress);
        url.searchParams.append("startblock", (lastCheckedBlock?.lastBlockNumber || 0).toString());
        url.searchParams.append("sort", "asc");
        url.searchParams.append("apikey", apiKey);

        const response = await fetch(url.toString());
        const data = await response.json();
        return data.result;
    }

    async function checkAllTransactionsForChain(chain: Chain) {
        const transactions = await fetchNativeTransactions(ADDRESS_TO_MONITOR_TYPE_GUARD, chain);
        if (!transactions.length) return;

        for (const tx of transactions) {
            if (!tx.to || tx.to.toLowerCase() !== ADDRESS_TO_MONITOR_TYPE_GUARD.toLowerCase()) {
                continue;
            }

            await db
                .insert(walletLastCheckedBlock)
                .values({
                    address: ADDRESS_TO_MONITOR_TYPE_GUARD.toLowerCase(),
                    chainName: chain,
                    lastBlockNumber: tx.blockNumber,
                    id: crypto.randomUUID(),
                })
                .onConflictDoUpdate({
                    target: [walletLastCheckedBlock.address, walletLastCheckedBlock.chainName],
                    set: { lastBlockNumber: tx.blockNumber },
                })
                .execute();

            const [sameHash] = await db
                .select()
                .from(userCryptoCheckout)
                .where(
                    and(
                        eq(userCryptoCheckout.transactionHash, tx.hash.toLowerCase()),
                        eq(userCryptoCheckout.status, "payed")
                    )
                )
                .limit(1)
                .execute();

            if (sameHash) {
                continue;
            }

            const [check] = await db
                .select()
                .from(userCryptoCheckout)
                .where(
                    and(
                        eq(userCryptoCheckout.chainName, chain),
                        eq(userCryptoCheckout.addressFrom, tx.from.toLowerCase()),
                        eq(userCryptoCheckout.valueWei, tx.value),
                        eq(userCryptoCheckout.status, "active")
                    )
                )
                .execute();

            if (!check) {
                continue;
            }

            await db
                .update(userCryptoCheckout)
                .set({ status: "payed", transactionHash: tx.hash.toLowerCase() })
                .where(eq(userCryptoCheckout.id, check.id))
                .execute();
            logger.info(`web3: payed check ${check.id}, hash ${tx.hash.toLowerCase()}`);

            unsubscribe(check.chainName);

            const plan = await db.select().from(plans).where(eq(plans.id, check.planId)).limit(1);
            if (!plan.length) throw new HttpException(HttpStatus.NOT_FOUND, "Plan not found");

            await db
                .update(userPlans)
                .set({ status: "cancelled", canceledAt: new Date() })
                .where(and(eq(userPlans.userId, check.userId), eq(userPlans.status, "active")))
                .execute();

            const startDate = new Date();
            const endDate = new Date(
                startDate.getTime() + (check.annualPayment ? 365 : plan[0].resetPeriodDays || 30) * 24 * 60 * 60 * 1000
            );

            await db
                .insert(userPlans)
                .values({
                    id: crypto.randomUUID(),
                    userId: check.userId,
                    planId: check.planId,
                    startDate,
                    endDate,
                    status: "active",
                    transactionHash: tx.hash.toLowerCase(),
                })
                .execute();
        }
    }

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

    async function verifyTransactionByHash(
        hash: string,
        chain: Chain,
        expectedSender: string,
        expectedValue: string
    ): Promise<boolean> {
        const { baseUrl, apiKey, delayMS } = chainExplorerMap[chain];
        const url = new URL(baseUrl);
        url.searchParams.set("module", "proxy");
        url.searchParams.set("action", "eth_getTransactionReceipt");
        url.searchParams.set("txhash", hash);
        url.searchParams.set("apikey", apiKey);

        let receiptData = null;
        while (receiptData === null) {
            const receiptResponse = await fetch(url.toString());
            const data = await receiptResponse.json();
            receiptData = data.result;

            if (receiptData === null) {
                await new Promise((resolve) => setTimeout(resolve, delayMS));
            }
        }

        const txUrl = new URL(baseUrl);
        txUrl.searchParams.set("module", "proxy");
        txUrl.searchParams.set("action", "eth_getTransactionByHash");
        txUrl.searchParams.set("txhash", hash);
        txUrl.searchParams.set("apikey", apiKey);

        const txResponse = await fetch(txUrl.toString());
        const txData = await txResponse.json();

        const { from, to, value } = txData.result;
        if (!from || !to || !value) {
            return false;
        }

        const senderMatches = from.toLowerCase() === expectedSender.toLowerCase();
        const receiverMatches = to.toLowerCase() === ADDRESS_TO_MONITOR_TYPE_GUARD.toLowerCase();
        const valueMatches = parseInt(value, 16).toString() === expectedValue;

        return senderMatches && receiverMatches && valueMatches;
    }

    async function unsubscribe(chain: string): Promise<void> {
        const chainTyped = chain.toLowerCase() as Chain;

        const rest = await db
            .select()
            .from(userCryptoCheckout)
            .where(and(eq(userCryptoCheckout.chainName, chainTyped), eq(userCryptoCheckout.status, "active")))
            .limit(1)
            .execute();

        if (!rest.length) {
            stopIntervalForChain(chainTyped);
        }
    }

    async function handlePlanExpiry(userId: number) {
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
            .limit(1)
            .execute();

        if (currentPlan) {
            await db.update(userPlans).set({ status: "expired" }).where(eq(userPlans.id, currentPlan.id));

            const freePlan = await db.select().from(plans).where(eq(plans.name, "basic")).limit(1).execute();

            if (!freePlan.length) throw new HttpException(HttpStatus.NOT_FOUND, "Free Plan not found");

            const startDate = new Date();
            const endDate = new Date(startDate.getTime() + (freePlan[0].resetPeriodDays || 30) * 24 * 60 * 60 * 1000);

            await db
                .insert(userPlans)
                .values({
                    id: crypto.randomUUID(),
                    userId,
                    planId: freePlan[0].id,
                    startDate,
                    endDate,
                    status: "active",
                })
                .execute();
        }
    }

    async function createCheckoutDb(checkoutData: Omit<Checkout, "id">): Promise<Checkout & { id: string }> {
        const { userId, planId, symbol, valueWei, chainName, addressFrom, annualPayment } = checkoutData;
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
                annualPayment,
            })
            .returning();

        return checkout;
    }

    const createCheckout = catchAsync(async (req, res) => {
        const { symbol, chain, sender, planId, annualPayment } = req.body;
        const typedChain = chain.toLowerCase();

        if (!isValidChain(typedChain)) {
            return res
                .status(HttpStatus.BAD_REQUEST)
                .json({ error: `Unable to create checkout: unknown chain ${chain}` });
        }

        const { token } = req;
        const userToken = await token;
        const userId = parseInt(userToken?.sub);

        const [active] = await db
            .select()
            .from(userPlans)
            .where(and(eq(userPlans.userId, userId), eq(userPlans.status, "active"), eq(userPlans.planId, planId)))
            .limit(1)
            .execute();

        if (active) {
            return res
                .status(HttpStatus.BAD_REQUEST)
                .json({ error: "Unable to create checkout: The selected plan is already active." });
        }

        const [plan] = await db.select().from(plans).where(eq(plans.id, planId));
        if (!plan) {
            return res
                .status(HttpStatus.BAD_REQUEST)
                .json({ error: "Unable to create checkout: The selected plan is not found." });
        }

        const rates = await fetchRates(symbol.toString());
        const quote = rates[symbol.toString()]?.quote;
        if (!quote) throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to fetch rates");

        const { price } = quote.USD;
        const web3 = new Web3();
        // const PRICE = 0.001;
        const PRICE = (annualPayment ? plan.annualPrice : plan.price) / USD;
        const wei = web3.utils.toWei((PRICE / price).toString(), "ether");

        const check = await createCheckoutDb({
            userId,
            planId,
            symbol,
            addressFrom: sender.toLowerCase(),
            valueWei: wei,
            status: "active",
            chainName: typedChain,
            annualPayment,
        });

        logger.info(`web3: created checkout ${check.id} - ${PRICE / price} ${symbol}`);

        await startIntervalForChain(typedChain);

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
            .limit(1)
            .execute();

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

        logger.info(`web3: cancelled checkout ${deleted.id}`);

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
            .limit(1)
            .execute();

        if (!checkout) {
            return res.status(HttpStatus.NOT_FOUND).json({ error: "Checkout not found or already confirmed." });
        }

        const isValidTransaction = await verifyTransactionByHash(
            hash,
            checkout.chainName as Chain,
            checkout.addressFrom,
            checkout.valueWei
        );

        if (!isValidTransaction) {
            return res.status(400).json({ error: "Transaction hash does not match the checkout details." });
        }

        const [confirmed] = await db
            .select()
            .from(userCryptoCheckout)
            .where(and(eq(userCryptoCheckout.transactionHash, hash), eq(userCryptoCheckout.status, "payed")))
            .execute();

        if (confirmed) {
            logger.info(`web3: checkout ${checkout.id} was already confirmed by ${hash}`);
            return res.status(HttpStatus.OK).json({ message: "Checkout confirmed successfully." });
        }

        const [confirmedCheckout] = await db
            .update(userCryptoCheckout)
            .set({
                status: "confirmed",
                transactionHash: hash,
            })
            .where(and(eq(userCryptoCheckout.userId, userId), eq(userCryptoCheckout.planId, planId)))
            .returning()
            .execute();

        logger.info(`web3: confirmed checkout ${checkout.id} by hash ${hash}`);
        unsubscribe(checkout.chainName);

        const plan = await db.select().from(plans).where(eq(plans.id, checkout.planId)).limit(1);
        if (!plan.length) throw new HttpException(HttpStatus.NOT_FOUND, "Plan not found");

        await db
            .update(userPlans)
            .set({
                status: "cancelled",
                canceledAt: new Date(),
            })
            .where(and(eq(userPlans.userId, checkout.userId), eq(userPlans.status, "active")))
            .execute();

        const startDate = new Date();
        const endDate = new Date(
            startDate.getTime() +
                (confirmedCheckout.annualPayment ? 365 : plan[0].resetPeriodDays || 30) * 24 * 60 * 60 * 1000
        );

        await db
            .insert(userPlans)
            .values({
                id: crypto.randomUUID(),
                userId: checkout.userId,
                planId: checkout.planId,
                startDate,
                endDate,
                status: "active",
                transactionHash: hash,
            })
            .execute();

        res.status(HttpStatus.OK).json({ message: "Checkout confirmed successfully." });
    });

    return {
        createCheckout,
        cancelCheckout,
        confirmCheckout,
        handlePlanExpiry,
        async cleanup() {},
    };
};
