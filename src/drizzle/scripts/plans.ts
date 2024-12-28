import { db } from "drizzle/db";
import { Plan, plans, aiModels, AiModel, ModelLimit, modelLimits } from "drizzle/entities/plans";
import { and, eq } from "drizzle-orm";

const BYTES_IN_MB = 1024 * 1024;
const BYTES_IN_GB = BYTES_IN_MB * 1024;
const RUB = 100;

export const AI_MODELS: AiModel[] = [
    {
        id: "gpt-4o-mini",
        name: "gpt-4o-mini",
        displayName: "GPT-4o mini",
        isDefault: true,
    },
    {
        id: "gpt-4o",
        name: "gpt-4o",
        displayName: "GPT-4o",
        isDefault: false,
    },
];

export const PLANS: Plan[] = [
    {
        id: "basic",
        name: "basic",
        description: "Free plan",
        monthlyTokenLimit: 100_000,
        resetPeriodDays: 7,
        price: 0 * RUB,
        version: 1,
        storageLimit: 100, // 100MB
    },
    {
        id: "plus",
        name: "plus",
        description: "Plus plan",
        monthlyTokenLimit: 1_000_000,
        resetPeriodDays: 30,
        price: 1200 * RUB,
        version: 1,
        storageLimit: 100_000, // 100GB
    },
];

export const PLAN_MODEL_LIMITS: ModelLimit[] = [
    {
        id: "basic-gpt-4o-mini",
        planId: "basic",
        modelId: "gpt-4o-mini",
        dailyRequestLimit: null,
        weeklyRequestLimit: 30,
        isEnabled: true,
    },
    {
        id: "basic-gpt-4o",
        planId: "basic",
        modelId: "gpt-4o",
        dailyRequestLimit: null,
        weeklyRequestLimit: null,
        isEnabled: false, // Disabled for free plan
    },
    {
        id: "plus-gpt-4o-mini",
        planId: "plus",
        modelId: "gpt-4o-mini",
        dailyRequestLimit: null,
        weeklyRequestLimit: null, // Unlimited
        isEnabled: true,
    },
    {
        id: "plus-gpt-4o",
        planId: "plus",
        modelId: "gpt-4o",
        dailyRequestLimit: 50,
        weeklyRequestLimit: null,
        isEnabled: true,
    },
];

function isEqual<T extends Record<string, any>>(existing: T, updated: T, fields: (keyof T)[]): boolean {
    return fields.every((field) => existing[field] === updated[field]);
}

export async function updatePlans() {
    console.log("Starting system initialization...");

    try {
        console.log("Syncing AI models...");
        const existingModels = await db.select().from(aiModels);
        const existingModelMap = new Map(existingModels.map((m) => [m.id, m]));

        for (const model of AI_MODELS) {
            const existingModel = existingModelMap.get(model.id);

            if (existingModel) {
                if (!isEqual(existingModel, model, ["name", "displayName", "isDefault"])) {
                    await db.update(aiModels).set(model).where(eq(aiModels.id, model.id));
                    console.log(`Updated AI model: ${model.name}`);
                }
            } else {
                await db.insert(aiModels).values(model);
                console.log(`Created new AI model: ${model.name}`);
            }
        }

        console.log("Syncing plans...");
        const existingPlans = await db.select().from(plans);
        const existingPlanMap = new Map(existingPlans.map((t) => [t.id, t]));

        for (const plan of PLANS) {
            const existingPlan = existingPlanMap.get(plan.id);

            if (existingPlan) {
                if (
                    !isEqual(existingPlan, plan, [
                        "name",
                        "description",
                        "monthlyTokenLimit",
                        "resetPeriodDays",
                        "price",
                        "storageLimit",
                    ])
                ) {
                    await db.update(plans).set(plan).where(eq(plans.id, plan.id));
                    console.log(`Updated plan: ${plan.name}`);
                }
            } else {
                await db.insert(plans).values(plan);
                console.log(`Created new plan: ${plan.name}`);
            }
        }

        console.log("Syncing plan model limits ...");
        const existingLimits = await db.select().from(modelLimits);
        const getLimitKey = (limit: Omit<ModelLimit, "id">) => `${limit.planId}-${limit.modelId}`;
        const existingLimitMap = new Map(existingLimits.map((l) => [`${l.id}-${l.modelId}`, l]));

        for (const limit of PLAN_MODEL_LIMITS) {
            const existingLimit = existingLimitMap.get(getLimitKey(limit));

            if (existingLimit) {
                if (!isEqual(existingLimit, limit, ["dailyRequestLimit", "weeklyRequestLimit", "isEnabled"])) {
                    await db
                        .update(modelLimits)
                        .set(limit)
                        .where(and(eq(modelLimits.id, limit.planId), eq(modelLimits.modelId, limit.modelId)));
                    console.log(`Updated plan model limit: ${limit.planId}-${limit.modelId}`);
                }
            } else {
                await db
                    .insert(modelLimits)
                    .values({
                        ...limit,
                    })
                    .onConflictDoNothing();
                console.log(`Created new plan model limit: ${limit.planId}-${limit.modelId}`);
            }
        }

        for (const [modelId, model] of existingModelMap) {
            if (!AI_MODELS.some((m) => m.id === modelId)) {
                await db.delete(aiModels).where(eq(aiModels.id, modelId));
                console.log(`Removed deprecated AI model: ${model.name}`);
            }
        }

        for (const [planId, plan] of existingPlanMap) {
            if (!PLANS.some((t) => t.id === planId)) {
                await db.delete(plans).where(eq(plans.id, planId));
                console.log(`Removed deprecated plan: ${plan.name}`);
            }
        }

        for (const limit of existingLimits) {
            if (!PLAN_MODEL_LIMITS.some((l) => l.planId === limit.planId && l.modelId === limit.modelId)) {
                await db
                    .delete(modelLimits)
                    .where(and(eq(modelLimits.planId, limit.planId), eq(modelLimits.modelId, limit.modelId)));
                console.log(`Removed deprecated model limit: ${limit.planId}-${limit.modelId}`);
            }
        }

        console.log("System initialization completed successfully");
    } catch (error) {
        console.error("Error during system initialization:", error);
        throw error;
    }
}
