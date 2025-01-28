import { and, eq } from "drizzle-orm";
import { db } from 'drizzle/db';
import { userPasswords } from "drizzle/entities";

/**
 * Function to add password to a user.
 */
export async function addPassword(userId: number, password: string) {
	await db.insert(userPasswords)
		.values({ userId, password })
		.execute();
}

/**
 * 
 */
export async function getPassword(userId: number) {
	const [passwordRecords] = await db.select({ password: userPasswords.password })
		.from(userPasswords)
		.where(eq(userPasswords.userId, userId))
		.execute();

	return passwordRecords?.password;
}

/**
 * Function to check password.
 * @returns boolean
 */
export async function checkPassword(userId: number, password: string) {
	const passwordRecords = await db.select()
		.from(userPasswords)
		.where(and(
			eq(userPasswords.userId, userId),
			eq(userPasswords.password, password)
		)).execute();

	return passwordRecords.length > 0;
}

/**
 * 
 */
export async function deletePassword(userId: number) {
	await db.delete(userPasswords)
		.where(eq(userPasswords.userId, userId))
		.execute();
}