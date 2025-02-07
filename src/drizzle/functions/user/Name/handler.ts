import { eq } from "drizzle-orm";
import { db } from "drizzle/db";
import { userNames } from "drizzle/entities";

/**
 * Function to add username.
 */
export async function addUsername(userId: number, name: string) {
    await db.insert(userNames).values({ userId, name }).execute();
}

/**
 * Function to change username.
 */
export async function changeUsername(userId: number, name: string) {
    await db.insert(userNames).values({ userId, name }).onConflictDoUpdate({ target: userNames.userId, set: { name } });
}
