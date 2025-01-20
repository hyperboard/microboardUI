import { and, gte, lte, sql } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { db } from "drizzle/db";
import { boardOwner, boards, chat, message } from "drizzle/entities";
import { aiModels, modelLimits, plans, userPlans, userStorageUsage } from "drizzle/entities/plans";

export function getCurrentPeriods() {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const dayOfWeek = now.getDay();
    const daysSinceMonday = (dayOfWeek + 6) % 7;
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfToday.getDate() - daysSinceMonday);

    return {
        daily: {
            start: startOfToday,
            end: now,
            resetDate: new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000),
        },
        weekly: {
            start: startOfWeek,
            end: now,
            resetDate: new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000),
        },
    };
}

export async function getCurrentUserPlan(userId: number) {
    const now = new Date();
    const pendingPlan = await db
        .select({
            planId: userPlans.planId,
            monthlyTokenLimit: plans.monthlyTokenLimit,
            name: plans.name,
            startDate: userPlans.startDate,
            endDate: userPlans.endDate,
            status: userPlans.status,
            storageLimit: plans.storageLimit,
        })
        .from(userPlans)
        .innerJoin(plans, eq(userPlans.planId, plans.id))
        .where(
            and(
                eq(userPlans.userId, userId),
                eq(userPlans.status, "pending_cancellation"),
                lte(userPlans.startDate, now),
                gte(userPlans.endDate, now)
            )
        )
        .limit(1);
    const currentPlan = await db
        .select({
            planId: userPlans.planId,
            monthlyTokenLimit: plans.monthlyTokenLimit,
            name: plans.name,
            startDate: userPlans.startDate,
            endDate: userPlans.endDate,
            status: userPlans.status,
            storageLimit: plans.storageLimit,
        })
        .from(userPlans)
        .innerJoin(plans, eq(userPlans.planId, plans.id))
        .where(
            and(
                eq(userPlans.userId, userId),
                eq(userPlans.status, "active"),
                lte(userPlans.startDate, now),
                gte(userPlans.endDate, now)
            )
        )
        .limit(1);

    if (!pendingPlan.length && !currentPlan.length) {
        const freePlan = await db
            .select({
                planId: plans.id,
                monthlyTokenLimit: plans.monthlyTokenLimit,
                name: plans.name,
                storageLimit: plans.storageLimit,
            })
            .from(plans)
            .where(eq(plans.name, "basic"))
            .limit(1);

        if (!freePlan.length) {
            throw new Error("Free plan not found in the system.");
        }

        const now = new Date();
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        return {
            planId: freePlan[0].planId,
            monthlyTokenLimit: freePlan[0].monthlyTokenLimit,
            name: freePlan[0].name,
            startDate: now,
            endDate: thirtyDaysFromNow,
            status: "active" as const,
            storageLimit: freePlan[0].storageLimit,
        };
    }

    return pendingPlan[0] || currentPlan[0];
}

export async function getCurrentModelLimits(userId: number) {
    const userPlan = await getCurrentUserPlan(userId);
    const modelLimitsQuery = await db
        .select({
            modelId: aiModels.id,
            modelName: aiModels.name,
            displayName: aiModels.displayName,
            isDefault: aiModels.isDefault,
            dailyLimit: modelLimits.dailyRequestLimit,
            weeklyLimit: modelLimits.weeklyRequestLimit,
            isEnabled: modelLimits.isEnabled,
        })
        .from(aiModels)
        .leftJoin(modelLimits, and(eq(modelLimits.modelId, aiModels.id), eq(modelLimits.planId, userPlan.planId)));

    const periods = getCurrentPeriods();
    const usage = await Promise.all(
        modelLimitsQuery.map(async (model) => {
            const [dailyUsage, weeklyUsage] = await Promise.all([
                db
                    .select({
                        count: sql<number>`count(${message.id})`,
                    })
                    .from(message)
                    .innerJoin(chat, eq(message.chatId, chat.id))
                    .innerJoin(boards, sql`${chat.boardId}::text = ${boards.uniqId}::text`)
                    .innerJoin(boardOwner, eq(boards.id, boardOwner.boardId))
                    .where(
                        and(
                            eq(message.model, model.modelName),
                            eq(boardOwner.ownerId, userId),
                            eq(message.role, "assistant"),
                            gte(message.createdAt, periods.daily.start),
                            lte(message.createdAt, periods.daily.end)
                        )
                    ),
                db
                    .select({
                        count: sql<number>`count(${message.id})`,
                    })
                    .from(message)
                    .innerJoin(chat, eq(message.chatId, chat.id))
                    .innerJoin(boards, sql`${chat.boardId}::text = ${boards.uniqId}::text`)
                    .innerJoin(boardOwner, eq(boards.id, boardOwner.boardId))
                    .where(
                        and(
                            eq(message.model, model.modelName),
                            eq(boardOwner.ownerId, userId),
                            eq(message.role, "assistant"),
                            gte(message.createdAt, periods.weekly.start),
                            lte(message.createdAt, periods.weekly.end)
                        )
                    ),
            ]);

            return {
                ...model,
                dailyUsage: dailyUsage[0].count,
                weeklyUsage: weeklyUsage[0].count,
            };
        })
    );

    return usage;
}

export async function getCurrentPeriodTokenUsage(userId: number, startDate: Date, endDate: Date) {
    const result = await db
        .select({
            totalTokens: sql<number>`COALESCE(SUM(${message.tokensUsed}), 0)`,
        })
        .from(message)
        .innerJoin(chat, eq(message.chatId, chat.id))
        .innerJoin(boards, sql`${chat.boardId}::text = ${boards.uniqId}::text`)
        .innerJoin(boardOwner, eq(boards.id, boardOwner.boardId))
        .where(and(eq(boardOwner.ownerId, userId), gte(message.createdAt, startDate), lte(message.createdAt, endDate)));

    return +result[0].totalTokens;
}

export async function getCurrentStorageUsage(userId: number) {
    const result = await db
        .select({
            totalBytes: userStorageUsage.totalBytes,
        })
        .from(userStorageUsage)
        .where(eq(userStorageUsage.userId, userId))
        .limit(1);

    return result.length ? result[0].totalBytes : 0;
}
