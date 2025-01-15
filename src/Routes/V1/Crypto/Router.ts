/*@ts-expect-error*/
import express from "express";
import winston from "winston";
import { createCryptoService } from "./monitor";
import Web3 from "web3";
import { catchAsync } from "shared/lib/catchAsync";
import { jwtMiddleware } from "Middlewares";
import { body, query } from "express-validator";
import { db } from "drizzle/db";
import { userCryptoCheckout, userPlans } from "drizzle/entities/plans";
import { and, eq } from "drizzle-orm";
import { Redis } from "Redis";

export const getCryproRouter = (redis: Redis, logger: winston.Logger): express.Router => {
    const router = express.Router();

    const ADDRESS_TO_MONITOR = process.env.SUBSCRIPTION_WALLET;
    const INFURA_API_KEY = process.env.INFURA_API_KEY;
    const COINMARKET_API_KEY = process.env.COINMARKET_API_KEY;

    if (!ADDRESS_TO_MONITOR || !INFURA_API_KEY || !COINMARKET_API_KEY) {
        throw new Error("web3: env is not set properly");
    }
    const COINMARKET_API_KEY_TYPE_GUARD = COINMARKET_API_KEY;

    const mainnetURL = `wss://mainnet.infura.io/ws/v3/${INFURA_API_KEY}`;
    const sepoliaURL = `wss://sepolia.infura.io/ws/v3/${INFURA_API_KEY}`;
    const polygonURL = `wss://polygon-mainnet.infura.io/ws/v3/${INFURA_API_KEY}`;
    const arbitrumURL = `wss://arbitrum-mainnet.infura.io/ws/v3/${INFURA_API_KEY}`;

    const chainURLMap: Record<string, string> = {
        Polygon: polygonURL,
        "Arbitrum One": arbitrumURL,
        Ethereum: mainnetURL,
        Sepolia: sepoliaURL,
    };
    // const URLChainMap: Record<string, string> = Object.fromEntries(
    //     Object.entries(chainURLMap).map(([key, value]) => [value, key])
    // );

    const cryptoService = createCryptoService(ADDRESS_TO_MONITOR, chainURLMap, redis, logger);

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

    router.post(
        "/crypto/checkout",
        jwtMiddleware(logger),
        body("chain").isString(),
        body("symbol").isString(),
        body("sender").isString(),
        body("planId").isString(),
        catchAsync(async (req, res) => {
            const { symbol, chain, sender, planId } = req.body;
            const providerURL = chainURLMap[chain];

            const { token } = req;
            const userToken = await token;
            const userId = parseInt(userToken?.sub);

            if (!providerURL) {
                return res
                    .status(400)
                    .json({ error: `Unable to create checkout: unknown chain ${chain}, provider URL not found` });
            }

            const [active] = await db
                .select()
                .from(userPlans)
                .where(and(eq(userPlans.userId, userId), eq(userPlans.status, "active"), eq(userPlans.planId, planId)))
                .limit(1);

            if (active) {
                return res
                    .status(400)
                    .json({ error: "Unable to create checkout: The selected plan is already active." });
            }

            try {
                const rates = await fetchRates(symbol.toString());
                const quote = rates[symbol.toString()]?.quote;
                if (!quote) {
                    throw new Error("Failed to fetch rates");
                }

                const { price } = quote.USD;
                const web3 = new Web3();
                const PRICE = 12; // price of subscrption in USD
                // const PRICE = 0.001; // price of subscrption in USD
                const wei = web3.utils.toWei((PRICE / price).toString(), "ether");

                const check = await cryptoService.createCheckout({
                    userId,
                    planId,
                    symbol,
                    addressFrom: sender.toLowerCase(),
                    valueWei: wei,
                    status: "active",
                    chainName: chain.toLowerCase(),
                });

                logger.info(`web3: created checkout ${check.id} - ${PRICE / price} ${symbol}`);

                await cryptoService.createBlockListener(providerURL, chain);

                res.status(200).json({ price: wei, symbol, address: ADDRESS_TO_MONITOR });
            } catch (error) {
                logger.error(`Error while creating checkout: ${error}`);
                res.status(500).json({ error: `Error while creating checkout: ${error}` });
            }
        })
    );

    router.delete(
        "/crypto/checkout",
        jwtMiddleware(logger),
        body("sender").isString(),
        body("to").isString(),
        body("value").isString(),
        catchAsync(async (req, res) => {
            const { value, to, sender } = req.body;

            if (to !== ADDRESS_TO_MONITOR) {
                return res
                    .status(400)
                    .json({ error: "Invalid address: 'to' address does not match the monitored address." });
            }

            const { token } = req;
            const userToken = await token;
            const userId = parseInt(userToken?.sub);

            try {
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
                    return res.status(404).json({ error: "Checkout not found" });
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

                cryptoService.unsubscribe(existingCheckout[0].chainName.toLowerCase());

                res.status(200).json({ message: "Checkout cancelled successfully" });
            } catch (error) {
                logger.error(`Error while cancelling checkout: ${error}`);
                res.status(500).json({ error: `Error while cancelling checkout: ${error}` });
            }
        })
    );

    //  // TEST
    // router.post(
    //     "/crypto/subscribe",
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

    return router;
};
