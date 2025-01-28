import { and, eq, ilike, isNotNull, sql } from "drizzle-orm";
import { db } from "drizzle/db";
import { boardOwner, boardPermissions, boards, userNames, userPasswords, users } from "drizzle/entities";
import { userAvatars } from "drizzle/entities/userAvatars";
import { addressNonce } from "drizzle/entities/userPasscodes";

/**
 * Function to add new user.
 */
export async function addUser(email: string, newsletter: boolean) {
    await db.insert(users).values({ email, newsletter }).execute();
}

/**
 * Function to delete user.
 */
export async function deleteUser(userId: number) {
    await db.delete(users).where(eq(users.id, userId)).execute();
}

/**
 * Function to save user token.
 */
export async function saveToken(userId: number, token: string) {
    await db.update(users).set({ refreshToken: token }).where(eq(users.id, userId)).execute();
    console.log(`set token ${token} for ${userId}`);
}

/**
 * Fucntion to get basic user info.
 */
export async function getUser(userId: number) {
    const [userRecords] = await db
        .select({
            userId: users.id,
            userEmail: users.email,
            userAddress: users.address,
            userName: userNames.name,
            avatar: userAvatars.avatar,
            avatarGenerated: userAvatars.generated,
            newsletter: users.newsletter,
        })
        .from(users)
        .leftJoin(userAvatars, eq(users.id, userAvatars.userId))
        .leftJoin(userNames, eq(users.id, userNames.userId))
        .where(eq(users.id, userId))
        .execute();

    return userRecords;
}

/**
 * Fucntion to get basic user info.
 */
export async function getUserByEmail(userEmail: string) {
    const [user] = await db
        .select({
            userId: users.id,
            userEmail: users.email,
            userAddress: users.address,
            userName: userNames.name,
            avatar: userAvatars.avatar,
            activated: users.activated,
        })
        .from(users)
        .leftJoin(userAvatars, eq(users.id, userAvatars.userId))
        .leftJoin(userNames, eq(users.id, userNames.userId))
        .where(eq(users.email, userEmail))
        .limit(1);

    return user;
}

/**
 * Fucntion to get users info by email
 */
export async function getUsersByEmail(userEmail: string = "", limit = 20) {
    const userRecords = await db
        .select({
            id: users.id,
            email: users.email,
            name: userNames.name,
            avatar: userAvatars.avatar,
        })
        .from(users)
        .leftJoin(userAvatars, eq(users.id, userAvatars.userId))
        .leftJoin(userNames, eq(users.id, userNames.userId))
        .where(ilike(users.email, `${userEmail}%`))
        .limit(limit);

    return userRecords;
}

/**
 * Function to get user info for authentication.
 */
export async function getUserAuthInfo(userEmail: string) {
    const [userRecords] = await db
        .select({
            id: users.id,
            email: users.email,
            userAddress: users.address,
            activated: users.activated,
            password: userPasswords.password,
            avatarGenerated: userAvatars.generated,
        })
        .from(users)
        .leftJoin(userPasswords, eq(users.id, userPasswords.userId))
        .leftJoin(userAvatars, eq(users.id, userAvatars.userId))
        .where(eq(users.email, userEmail))
        .execute();

    return userRecords;
}

export async function getRefreshToken(userId: number) {
    const [token] = await db.select({ token: users.refreshToken }).from(users).where(eq(users.id, userId)).execute();

    return token?.token!;
}

export async function updateRefreshToken(userId: number) {
    await db.update(users).set({ refreshToken: "" }).where(eq(users.id, userId)).execute();
}

/**
 * Function to get user boards.
 */
export async function getUserBoards(userId: number) {
    const authorizedBoardsUUIDs = await getAuthorizedUserBoards(userId);
    const canEditBoardsUUIDs = await getCanEditUserBoards(userId);
    const canViewBoardsUUIDs = await getCanViewUserBoards(userId);

    return {
        author: authorizedBoardsUUIDs.map((e) => e.boardUUID!),
        canEdit: canEditBoardsUUIDs.map((e) => e.boardUUID!),
        canView: canViewBoardsUUIDs.map((e) => e.boardUUID!),
    };
}

/**
 * Function to get boards from authorized user.
 * @returns list of boardUUID.
 */
export async function getAuthorizedUserBoards(userId: number) {
    return await db
        .select({ boardUUID: boards.uniqId })
        .from(boards)
        .innerJoin(boardOwner, eq(boards.id, boardOwner.boardId))
        .where(eq(boardOwner.ownerId, userId))
        .execute();
}

/**
 * Function for getting boards that user can edit.
 * @returns list of boardUUID.
 */
export async function getCanEditUserBoards(userId: number) {
    return await db
        .select({ boardUUID: boards.uniqId, title: boards.title, isPublic: boards.isPublic })
        .from(boards)
        .innerJoin(boardPermissions, eq(boards.id, boardPermissions.boardId))
        .where(and(eq(boardPermissions.userId, userId), eq(boardPermissions.canEdit, true)))
        .execute();
}

/**
 * Function for getting boards that user can view.
 * @returns list of boardUUID.
 */
export async function getCanViewUserBoards(userId: number) {
    return await db
        .select({ boardUUID: boards.uniqId })
        .from(boards)
        .innerJoin(boardPermissions, eq(boards.id, boardPermissions.boardId))
        .where(and(eq(boardPermissions.userId, userId), eq(boardPermissions.canView, true)))
        .execute();
}

/**
 * Function to get all user boards.
 * @returns list of boardUUID.
 */
export async function getBoardsByUser(userId: number) {
    const authored = await getAuthorizedUserBoards(userId);
    const canEdit = await getCanEditUserBoards(userId);
    const canView = await getCanViewUserBoards(userId);

    return [...authored, ...canView, ...canEdit];
}

/**
 * Function to set user active status in true.
 */
export async function updateUserActiveStatus(userId: number) {
    const [userRecords] = await db
        .update(users)
        .set({ activated: true })
        .where(eq(users.id, userId))
        .returning({ userId: users.id, userEmail: users.email, userAddress: users.address })
        .execute();

    return userRecords;
}

/**
 * Function to change newsletter.
 */
export async function changeNewsletter(userId: number, newsletter: boolean) {
    await db.update(users).set({ newsletter }).where(eq(users.id, userId)).execute();
}

/**
 * Function to get user by address. it creates the user if there is no user with such address
 */
export async function getOrCreateUserByAddress(userAddress: string) {
    userAddress = userAddress.toLowerCase();
    const dataToReturn = {
        userId: users.id,
        userEmail: users.email,
        userAddress: users.address,
        avatarGenerated: userAvatars.generated,
    };

    const [user] = await db
        .select(dataToReturn)
        .from(users)
        .where(eq(users.address, userAddress))
        .leftJoin(userAvatars, eq(users.id, userAvatars.userId))
        .execute();

    if (user) {
        return user;
    }

    const [createdUser] = await db
        .insert(users)
        .values({
            address: userAddress,
            activated: true,
        })
        .returning({
            userId: users.id,
            userEmail: users.email,
            userAddress: users.address,
        })
        .execute();

    const [userAvatar] = await db
        .select({
            avatarGenerated: userAvatars.generated,
        })
        .from(userAvatars)
        .where(eq(userAvatars.userId, createdUser.userId))
        .execute();

    return { ...createdUser, avatarGenerated: userAvatar?.avatarGenerated };
}

/**
 * Function to add an email to a user.
 * @param userId - The ID of the user to update.
 * @param email - The email to add to the user.
 * @throws an error if the email already exists.
 * @returns A message indicating the email was added successfully.
 */
export async function addEmail(userId: number, email: string) {
    const existingUser = await db.select({ userId: users.id }).from(users).where(eq(users.email, email)).execute();

    if (existingUser.length > 0) {
        throw new Error("Email already exists");
    }

    await db.update(users).set({ email }).where(eq(users.id, userId)).execute();
}
