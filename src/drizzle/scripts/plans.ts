import { db } from "drizzle/db";
import { Plan, plans, aiModels, AiModel, ModelLimit, modelLimits } from "drizzle/entities/plans";
import { and, eq, sql } from "drizzle-orm";

const BYTES_IN_MB = 1024 * 1024;
const BYTES_IN_GB = BYTES_IN_MB * 1024;
const RUB = 100;

export type PlanDefinition = Omit<Plan, "version" | "isActive">;
export type ModelLimitDefinition = Omit<ModelLimit, "planVersion">;

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
    {
        id: "image-generation",
        name: "image-generation",
        displayName: "Image Generation",
        isDefault: false,
    },
    {
        id: "deepseek-chat",
        name: "deepseek-chat",
        displayName: "DeepSeek Chat",
        isDefault: false,
    },
    {
        id: "deepseek-reasoner",
        name: "deepseek-reasoner",
        displayName: "DeepSeek Reasoner",
        isDefault: false,
    },
];

export const PLANS: PlanDefinition[] = [
    {
        id: "basic",
        name: "basic",
        description: "Free plan",
        monthlyTokenLimit: 100_000,
        resetPeriodDays: 7,
        price: 0 * RUB,
        storageLimit: 100, // 100MB
    },
    {
        id: "plus",
        name: "plus",
        description: "Plus plan",
        monthlyTokenLimit: 1_000_000,
        resetPeriodDays: 30,
        price: 1200 * RUB,
        storageLimit: 100_000, // 100GB
    },
];

export const PLAN_MODEL_LIMITS: ModelLimitDefinition[] = [
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
        isEnabled: false,
    },
    {
        id: "plus-gpt-4o-mini",
        planId: "plus",
        modelId: "gpt-4o-mini",
        dailyRequestLimit: null,
        weeklyRequestLimit: null,
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
    {
        id: "basic-image-generation",
        planId: "basic",
        modelId: "image-generation",
        dailyRequestLimit: null,
        weeklyRequestLimit: null,
        isEnabled: false,
    },
    {
        id: "plus-image-generation",
        planId: "plus",
        modelId: "image-generation",
        dailyRequestLimit: 25,
        weeklyRequestLimit: null,
        isEnabled: true,
    },
    {
        id: "basic-deepseek-chat",
        planId: "basic",
        modelId: "deepseek-chat",
        dailyRequestLimit: null,
        weeklyRequestLimit: null,
        isEnabled: false,
    },
    {
        id: "basic-deepseek-reasoner",
        planId: "basic",
        modelId: "deepseek-reasoner",
        dailyRequestLimit: null,
        weeklyRequestLimit: null,
        isEnabled: true,
    },
    {
        id: "plus-deepseek-chat",
        planId: "plus",
        modelId: "deepseek-chat",
        dailyRequestLimit: null,
        weeklyRequestLimit: null,
        isEnabled: true,
    },
    {
        id: "plus-deepseek-reasoner",
        planId: "plus",
        modelId: "deepseek-reasoner",
        dailyRequestLimit: null,
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
        await db.transaction(async (tx) => {
            console.log("Syncing AI models...");
            const existingModels = await tx.select().from(aiModels);
            const existingModelMap = new Map(existingModels.map((m) => [m.id, m]));

            for (const model of AI_MODELS) {
                const existingModel = existingModelMap.get(model.id);

                if (existingModel) {
                    if (!isEqual(existingModel, model, ["name", "displayName", "isDefault"])) {
                        await tx.update(aiModels).set(model).where(eq(aiModels.id, model.id));
                        console.log(`Updated AI model: ${model.name}`);
                    }
                } else {
                    await tx.insert(aiModels).values(model);
                    console.log(`Created new AI model: ${model.name}`);
                }
            }

            console.log("Syncing plans...");
            const existingActivePlans = await tx.select().from(plans).where(eq(plans.isActive, true));

            const existingActivePlanMap = new Map(existingActivePlans.map((p) => [p.id, p]));

            for (const planDef of PLANS) {
                const existingPlan = existingActivePlanMap.get(planDef.id);

                if (existingPlan) {
                    const existingLimits = await tx
                        .select()
                        .from(modelLimits)
                        .where(
                            and(eq(modelLimits.planId, planDef.id), eq(modelLimits.planVersion, existingPlan.version))
                        );

                    const existingLimitIds = new Set(existingLimits.map((limit) => limit.id));

                    const newLimits = PLAN_MODEL_LIMITS.filter((l) => l.planId === planDef.id)
                        .filter((l) => !existingLimitIds.has(l.id))
                        .map((limit) => ({
                            ...limit,
                            planVersion: existingPlan.version,
                        }));

                    if (newLimits.length > 0) {
                        for (const limit of newLimits) {
                            await tx.insert(modelLimits).values(limit).onConflictDoNothing();
                        }
                    }

                    if (
                        !isEqual(existingPlan, planDef, [
                            "name",
                            "description",
                            "monthlyTokenLimit",
                            "resetPeriodDays",
                            "price",
                            "storageLimit",
                        ])
                    ) {
                        await tx.update(plans).set({ isActive: false }).where(eq(plans.id, planDef.id));

                        const newPlan = {
                            ...planDef,
                            version: existingPlan.version + 1,
                            isActive: true,
                        };
                        await tx.insert(plans).values(newPlan);

                        const planLimits = PLAN_MODEL_LIMITS.filter((l) => l.planId === planDef.id).map((limit) => ({
                            ...limit,
                            planVersion: newPlan.version,
                        }));

                        for (const limit of planLimits) {
                            await tx.insert(modelLimits).values(limit).onConflictDoNothing();
                        }

                        console.log(`Updated plan ${planDef.name} to version ${newPlan.version}`);
                    } else {
                        console.log(`Plan ${planDef.name} is up to date`);
                    }
                } else {
                    const latestVersion = await tx
                        .select({ version: sql<number>`MAX(version)` })
                        .from(plans)
                        .where(eq(plans.id, planDef.id));

                    const newVersion = (latestVersion[0]?.version ?? 0) + 1;

                    const newPlan = {
                        ...planDef,
                        version: newVersion,
                        isActive: true,
                    };
                    await tx.insert(plans).values(newPlan);

                    const planLimits = PLAN_MODEL_LIMITS.filter((l) => l.planId === planDef.id).map((limit) => ({
                        ...limit,
                        planVersion: newVersion,
                    }));

                    for (const limit of planLimits) {
                        await tx.insert(modelLimits).values(limit).onConflictDoNothing();
                    }

                    console.log(`Created new plan: ${planDef.name} (v${newVersion})`);
                }
            }

            for (const [planId, plan] of existingActivePlanMap) {
                if (!PLANS.some((p) => p.id === planId)) {
                    await tx.update(plans).set({ isActive: false }).where(eq(plans.id, planId));
                    console.log(`Deactivated plan: ${plan.name} (v${plan.version})`);
                }
            }
        });

        console.log("System initialization completed successfully");
    } catch (error) {
        console.error("Error during system initialization:", error);
        throw error;
    }
}
