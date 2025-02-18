import { boards, users, boardEvents } from "drizzle/entities";
import { db } from "drizzle/db";
import { sql } from "drizzle-orm";
import { userPlans } from "drizzle/entities/plans";

export async function getTotalBoards() {
    const result = await db
        .select({ count: sql`COUNT(*)` })
        .from(boards)
        .execute();
    return result[0]?.count || 0;
}

export async function getNewBoardsToday() {
    const result = await db
        .select({ count: sql`COUNT(*)` })
        .from(boards)
        .where(sql`${boards.createdAt} >= CURRENT_DATE`)
        .execute();
    return result[0]?.count || 0;
}

export async function getTotalUsers() {
    const result = await db
        .select({ count: sql`COUNT(*)` })
        .from(users)
        .execute();
    return result[0]?.count || 0;
}

export async function getNewUsersToday() {
    const result = await db
        .select({ count: sql`COUNT(*)` })
        .from(users)
        .where(sql`${users.createdAt} >= CURRENT_DATE`)
        .execute();
    return result[0]?.count || 0;
}

export async function getTotalBoardEvents() {
    const result = await db
        .select({ count: sql`COUNT(*)` })
        .from(boardEvents)
        .execute();
    return result[0]?.count || 0;
}

export async function getFirstPaymentsToday() {
    const result = await db
        .select({ count: sql`COUNT(*)` })
        .from(userPlans)
        .where(sql`${userPlans.startDate} >= CURRENT_DATE AND status = 'active'`)
        .execute();
    return result[0]?.count || 0;
}

export async function getRenewalsToday() {
    const result = await db
        .select({ count: sql`COUNT(*)` })
        .from(userPlans)
        .where(
            sql`
            ${userPlans.startDate} >= CURRENT_DATE 
            AND status = 'active' 
            AND plan_id IN (
                SELECT plan_id 
                FROM user_plans 
                WHERE user_id = user_plans.user_id 
                AND start_date < CURRENT_DATE
            )
        `
        )
        .execute();
    return result[0]?.count || 0;
}

export async function getTotalPayingUsers() {
    const result = await db
        .select({ count: sql`COUNT(DISTINCT user_id)` })
        .from(userPlans)
        .where(sql`status = 'active'`)
        .execute();
    return result[0]?.count || 0;
}
