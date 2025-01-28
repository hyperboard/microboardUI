import { z } from "zod";

export const createCheckoutSchema = z.object({
    chain: z.string(),
    symbol: z.string(),
    sender: z.string(),
    planId: z.string(),
});

export const cancelCheckoutSchema = z.object({
    sender: z.string(),
    to: z.string(),
    value: z.string(),
});

export const confirmCheckoutSchema = z.object({
    planId: z.string(),
    hash: z.string(),
});