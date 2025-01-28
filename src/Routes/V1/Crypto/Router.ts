import express from "express";
import winston from "winston";
import { createCryptoService } from "./cryptoService";
import { jwtMiddleware, validateBody } from "Middlewares";
import { body } from "express-validator";
import { Redis } from "Redis";
import { cancelCheckoutSchema, confirmCheckoutSchema, createCheckoutSchema } from "./crypto-checkout-schema";

export const getCryptoRouter = (redis: Redis, logger: winston.Logger): express.Router => {
    const router = express.Router();

    const cryptoService = createCryptoService(redis, logger);

    router
        .route("/crypto/checkout")
        .all(jwtMiddleware(logger), body().not().isEmpty())
        .post(validateBody(createCheckoutSchema), cryptoService.createCheckout)
        .delete(validateBody(cancelCheckoutSchema), cryptoService.cancelCheckout)
        .patch(validateBody(confirmCheckoutSchema), cryptoService.confirmCheckout);

    return router;
};
