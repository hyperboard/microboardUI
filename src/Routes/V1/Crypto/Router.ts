import express from "express";
import winston from "winston";
import { createCryptoService, CryptoService } from "./cryptoService";
import { jwtMiddleware, validateBody } from "Middlewares";
import { body } from "express-validator";
import { Redis } from "Redis";
import { cancelCheckoutSchema, confirmCheckoutSchema, createCheckoutSchema } from "./crypto-checkout-schema";

export const getCryptoRouter = (cryptoService: CryptoService, redis: Redis, logger: winston.Logger): express.Router => {
    const router = express.Router();

    router
        .route("/crypto/checkout")
        .all(jwtMiddleware(logger), body().not().isEmpty())
        .post(validateBody(createCheckoutSchema), cryptoService.createCheckout)
        .delete(validateBody(cancelCheckoutSchema), cryptoService.cancelCheckout)
        .patch(validateBody(confirmCheckoutSchema), cryptoService.confirmCheckout);

    return router;
};
