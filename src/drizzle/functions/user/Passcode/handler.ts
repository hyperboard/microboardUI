import { eq, sql } from "drizzle-orm";
import { db } from "drizzle/db";
import { userPasscodes } from "drizzle/entities";
import { addressNonce } from "drizzle/entities/userPasscodes";

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
    const [lastPasscode] = await db
        .select()
        .from(userPasscodes)
        .where(eq(userPasscodes.userId, userId))
        .orderBy(sql`${userPasscodes.created} DESC`)
        .limit(1)
        .execute();

    if (!lastPasscode) {
        return false;
    }

    await db
        .update(userPasscodes)
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
    const [lastPasscode] = await db
        .select()
        .from(userPasscodes)
        .where(eq(userPasscodes.userId, userId))
        .orderBy(sql`${userPasscodes.created} DESC`)
        .limit(1)
        .execute();

    return lastPasscode;
}

/**
 * Function to save nonce.
 */
export async function saveNonce(address: string, nonce: string) {
    await db
        .insert(addressNonce)
        .values({
            address: address.toLowerCase(),
            nonce,
        })
        .execute();
}

/**
 * Function to get the last nonce for a given address.
 * @param address - The address to retrieve the nonce for.
 * @returns The last nonce associated with the address or null if not found.
 */
export async function getLastNonce(address: string) {
    const [record] = await db
        .select()
        .from(addressNonce)
        .where(eq(addressNonce.address, address.toLowerCase()))
        .orderBy(sql`${addressNonce.created} DESC`)
        .limit(1)
        .execute();

    return record;
}

/**
 * Function to check nonce.
 * @returns boolean
 */
export async function checkNonce(
    nonceRecord: {
        id: number;
        created: Date;
        remainingAttempts: number;
        nonce: string;
        address: string;
    },
    address: string,
    recoveredAddress: string
): Promise<boolean> {
    if (address.toLowerCase() !== recoveredAddress.toLowerCase()) {
        return false;
    }

    await db
        .update(userPasscodes)
        .set({ remainingAttempts: sql`${userPasscodes.remainingAttempts} - 1` })
        .where(eq(userPasscodes.id, nonceRecord.id))
        .execute();

    return nonceRecord.remainingAttempts > 0;
}
