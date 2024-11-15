import { eq, sql } from "drizzle-orm";
import { db } from 'drizzle/db';
import { userPasscodes } from "drizzle/entities";

/**
 * Function to add passcode to a user
 */
export async function addPasscode(userId: number, passcode: string) {
	await db.insert(userPasscodes).values({ userId, passcode }).execute();
}

/**
 * Function to check passcode.
 * @returns boolean
 */
export async function checkPasscode(passcode: string, userId: number) {
	const [lastPasscode] = await db.select()
		.from(userPasscodes)
		.where(eq(userPasscodes.userId, userId))
		.orderBy(sql`${userPasscodes.created} DESC`)
		.limit(1)
		.execute();

	if (!lastPasscode) {	
		return false;
	}

	await db.update(userPasscodes)
		.set({ remainingAttempts: sql`${userPasscodes.remainingAttempts} - 1` })
		.where(eq(userPasscodes.id, lastPasscode.id))
		.execute();

	return lastPasscode.passcode === passcode && lastPasscode.remainingAttempts > 0;
}

/**
 * Function to get last user passcode.
 * @returns passcode.
 */
export async function getLastPasscode(userId: number) {
	const [lastPasscode] = await db.select()
		.from(userPasscodes)
		.where(eq(userPasscodes.userId, userId))
		.orderBy(sql`${userPasscodes.created} DESC`)
		.limit(1)
		.execute(); 

	return lastPasscode;
}