import { and, eq } from "drizzle-orm";
import { db } from "drizzle/db";
import { modelLimits } from "drizzle/entities";
import { StripeService } from "Routes/V1/Billing/stripe";
import { getAudioModelLimits, getCurrentModelLimits, getCurrentUserPlan } from "Routes/V1/Billing/utils";
import { CryptoService } from "Routes/V1/Crypto/cryptoService";
import winston from "winston";

type LimitResult = { canProceed: true } | { canProceed: false; error: string };

export class UsageLimitChecker {
    constructor(
        private logger: winston.Logger,
        private stripeService: StripeService,
        private cryptoService: CryptoService
    ) {}

    public async checkUserLimits(userId: number, modelId: string): Promise<LimitResult> {
        const userPlan = await getCurrentUserPlan(userId, this.stripeService, this.cryptoService);
        const mLimits = await db
            .select()
            .from(modelLimits)
            .where(and(eq(modelLimits.modelId, modelId), eq(modelLimits.planId, userPlan.planId)))
            .limit(1);

        const planLimit = mLimits[0];

        if (!planLimit?.isEnabled) {
            return { canProceed: false, error: "Model not available in your plan" };
        }

        if (!planLimit.dailyRequestLimit && !planLimit.weeklyRequestLimit) {
            return { canProceed: true };
        }

        const modelUsage = await getCurrentModelLimits(userId, this.stripeService, this.cryptoService);
        const currentModelUsage = modelUsage.find((m) => m.modelName === modelId);

        if (!currentModelUsage) {
            return { canProceed: false, error: "Model not found" };
        }

        this.logger.debug(
            `${modelId} - dailyUsage: ${currentModelUsage.dailyUsage}, weeklyUsage: ${currentModelUsage.weeklyUsage}`
        );

        if (
            (planLimit.dailyRequestLimit && currentModelUsage.dailyUsage >= planLimit.dailyRequestLimit) ||
            (planLimit.weeklyRequestLimit && currentModelUsage.weeklyUsage >= planLimit.weeklyRequestLimit)
        ) {
            return { canProceed: false, error: "Request limit exceeded" };
        }

        return { canProceed: true };
    }

    public async checkImageGenerationLimits(userId: number): Promise<LimitResult> {
        const modelUsage = await getCurrentModelLimits(userId, this.stripeService, this.cryptoService);
        const imageGenUsage = modelUsage.find((m) => m.modelName === "image-generation");

        if (!imageGenUsage?.isEnabled) {
            return { canProceed: false, error: "Image generation not available in your plan" };
        }

        if (!imageGenUsage.dailyLimit) {
            return { canProceed: true };
        }

        if (
            (imageGenUsage.dailyLimit && imageGenUsage.dailyUsage >= imageGenUsage.dailyLimit) ||
            (imageGenUsage.weeklyLimit && imageGenUsage.weeklyUsage >= imageGenUsage.weeklyLimit)
        ) {
            return { canProceed: false, error: "Image generation limit exceeded" };
        }

        return { canProceed: true };
    }

    public async checkAudioGenerationLimits(userId: number, text: string): Promise<LimitResult> {
        const modelUsage = await getAudioModelLimits(userId, this.stripeService, this.cryptoService);

        if (!modelUsage.monthlyUsage.limit) {
            return { canProceed: false, error: "Audio generation not available in your plan" };
        }

        if (modelUsage.monthlyUsage.limit && modelUsage.monthlyUsage.limit <= modelUsage.monthlyUsage.used) {
            return { canProceed: false, error: "Audio generation limit exceeded" };
        }

        return { canProceed: true };
    }
}
