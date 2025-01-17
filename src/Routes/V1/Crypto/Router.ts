import express from "express";
import winston from "winston";
import { createCryptoService } from "./monitor";
import { jwtMiddleware } from "Middlewares";
import { body } from "express-validator";
import { Redis } from "Redis";

export const getCryptoRouter = (redis: Redis, logger: winston.Logger): express.Router => {
    const router = express.Router();

    const cryptoService = createCryptoService(redis, logger);

    router.post(
        "/crypto/checkout",
        jwtMiddleware(logger),
        body("chain").isString(),
        body("symbol").isString(),
        body("sender").isString(),
        body("planId").isString(),
        cryptoService.createCheckout
    );

    router.delete(
        "/crypto/checkout",
        jwtMiddleware(logger),
        body("sender").isString(),
        body("to").isString(),
        body("value").isString(),
        cryptoService.cancelCheckout
    );

    router.patch(
        "/crypto/checkout",
        jwtMiddleware(logger),
        body("planId").isString(),
        body("hash").isString(),
        cryptoService.confirmCheckout
    );

    return router;
};
