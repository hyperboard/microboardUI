import { eq, and, gt } from "drizzle-orm";
import { db } from 'drizzle/db';
import { userPasswordResetRequests } from 'drizzle/entities';

/**
 *  
 */
export async function createPasswordResetRequests(userId: number, userToken: string, expirationTime: Date) {
	await db.insert(userPasswordResetRequests)
		.values({ userId, token: userToken, expirationTime })
		.execute();
}

/**
 *  
 */
export async function updatePasswordResetRequests(userId: number, userToken: string, expirationTime: Date) {
	await db.update(userPasswordResetRequests)
		.set({ userId, token: userToken, expirationTime })
		.execute();
}

/**
 * 
 */
export async function getPasswordResetRequests(token: string) {
	const [result] = await db.select()
		.from(userPasswordResetRequests)
		.where(and(eq(userPasswordResetRequests.token, token),
			// gt(userPasswordResetRequests.expirationTime, Date.now())
		))
		.execute();

	return result;
}

/**
 * 
 */
export async function deletePasswordResetRequests(userId: number) {
	return await db.delete(userPasswordResetRequests)
		.where(eq(userPasswordResetRequests.userId, userId))
		.returning({ userId: userPasswordResetRequests.userId })
		.execute();
}