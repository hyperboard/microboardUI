import { eq } from "drizzle-orm";
import { db } from 'drizzle/db';
import { userNames } from "drizzle/entities";
import { userAvatars } from "drizzle/entities/userAvatars";

/**
 * Function to add username.
 */
export async function addAvatar(userId: number, avatar: string, generated = false) {
  await db.insert(userAvatars)
    .values({ userId, avatar })
    .onConflictDoUpdate({
      target: userAvatars.userId,
      set: { avatar, generated }
    })
    .execute();
}

/**
 * Function to change avatar.
 */
export async function changeAvatar(userId: number, avatar: string) {
  await db.update(userAvatars)
    .set({ avatar })
    .where(eq(userNames.userId, userId))
    .execute();
}