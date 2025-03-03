import { db } from "drizzle/db";
import { Plan, plans, aiModels, AiModel, ModelLimit, modelLimits } from "drizzle/entities/plans";
import { eq, desc, not } from "drizzle-orm";

const BYTES_IN_MB = 1024 * 1024;
const BYTES_IN_GB = BYTES_IN_MB * 1024;
export const USD = 100;

export type PlanDefinition = Omit<Plan, "version" | "isActive">;
export type ModelLimitDefinition = Omit<ModelLimit, "planVersion">;

export const AI_MODELS: Omit<AiModel, "isArchived">[] = [
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
    {
        id: "flux-schnell",
        name: "flux-schnell",
        displayName: "Flux.1 schnell",
        isDefault: false,
    },
    {
        id: "tts-1-hd",
        name: "tts-1-hd",
        displayName: "Text to speech",
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
        price: 0 * USD,
        annualPrice: 0,
        storageLimit: 100, // 100MB
        textToSpeech: 0, // 0 symbols
    },
    {
        id: "plus",
        name: "plus",
        description: "Plus plan",
        monthlyTokenLimit: 1_000_000,
        resetPeriodDays: 30,
        price: 18 * USD,
        annualPrice: 144 * USD,
        storageLimit: 100_000, // 100GB
        textToSpeech: 15_000, // 15k symbols
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
        id: "plus-gpt-4o-mini",
        planId: "plus",
        modelId: "gpt-4o-mini",
        dailyRequestLimit: null,
        weeklyRequestLimit: null,
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
        id: "plus-deepseek-chat",
        planId: "plus",
        modelId: "deepseek-chat",
        dailyRequestLimit: null,
        weeklyRequestLimit: null,
        isEnabled: true,
    },
    {
        id: "basic-deepseek-reasoner",
        planId: "basic",
        modelId: "deepseek-reasoner",
        dailyRequestLimit: null,
        weeklyRequestLimit: null,
        isEnabled: false,
    },
    {
        id: "plus-deepseek-reasoner",
        planId: "plus",
        modelId: "deepseek-reasoner",
        dailyRequestLimit: 100,
        weeklyRequestLimit: null,
        isEnabled: true,
    },
    {
        id: "basic-flux-schnell",
        planId: "basic",
        modelId: "flux-schnell",
        dailyRequestLimit: null,
        weeklyRequestLimit: null,
        isEnabled: false,
    },
    {
        id: "plus-flux-schnell",
        planId: "plus",
        modelId: "flux-schnell",
        dailyRequestLimit: 25,
        weeklyRequestLimit: null,
        isEnabled: true,
    },
    {
        id: "basic-tts-1-hd",
        planId: "basic",
        modelId: "tts-1-hd",
        dailyRequestLimit: null,
        weeklyRequestLimit: null,
        isEnabled: false,
    },
    {
        id: "plus-tts-1-hd",
        planId: "plus",
        modelId: "tts-1-hd",
        dailyRequestLimit: null,
        weeklyRequestLimit: null,
        isEnabled: true,
    },
];

function isEqual<T extends Record<string, any>>(existing: T, updated: T, fields: (keyof T)[]): boolean {
    return fields.every((field) => existing[field] === updated[field]);
}
export async function updatePlans() {
    try {
        await db.transaction(async (tx) => {
            console.log("Syncing AI models...");
            // ssot for models
            for (const model of AI_MODELS) {
                await tx
                    .insert(aiModels)
                    .values(model)
                    .onConflictDoUpdate({
                        target: aiModels.id,
                        set: {
                            name: model.name,
                            displayName: model.displayName,
                            isDefault: model.isDefault,
                        },
                    });
                await tx
                    .update(aiModels)
                    .set({ isArchived: true })
                    .where(not(eq(aiModels.id, model.id)));
            }

            console.log("Syncing plans...");
            for (const planDef of PLANS) {
                const existingPlans = await tx
                    .select()
                    .from(plans)
                    .where(eq(plans.id, planDef.id))
                    .orderBy(desc(plans.version));

                let currentVersion = 1;
                let shouldCreateNewVersion = false;

                if (existingPlans.length > 0) {
                    const existingPlan = existingPlans[0];
                    currentVersion = existingPlan.version;

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
                        shouldCreateNewVersion = true;
                        currentVersion += 1;

                        await tx.update(plans).set({ isActive: false }).where(eq(plans.id, planDef.id));
                    }
                }

                if (shouldCreateNewVersion || existingPlans.length === 0) {
                    const newPlan = {
                        ...planDef,
                        version: currentVersion,
                        isActive: true,
                    };
                    await tx.insert(plans).values(newPlan);
                }

                const planModelLimits = PLAN_MODEL_LIMITS.filter((l) => l.planId === planDef.id).map((limit) => ({
                    ...limit,
                    planVersion: currentVersion,
                }));

                for (const limit of planModelLimits) {
                    await tx
                        .insert(modelLimits)
                        .values(limit)
                        .onConflictDoUpdate({
                            target: [modelLimits.id, modelLimits.planVersion],
                            set: {
                                modelId: limit.modelId,
                                dailyRequestLimit: limit.dailyRequestLimit,
                                weeklyRequestLimit: limit.weeklyRequestLimit,
                                isEnabled: limit.isEnabled,
                            },
                        });
                }
            }

            console.log("Plans synchronized successfully");
        });

        console.log("All plans and models updated successfully");
    } catch (error) {
        console.error("Error updating plans:", error);
        throw error;
    }
}
