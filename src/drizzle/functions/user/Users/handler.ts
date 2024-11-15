import { and, eq, isNotNull } from "drizzle-orm";
import { db } from "drizzle/db";
import { boardOwner, boardPermissions, boards, userNames, userPasswords, users } from "drizzle/entities";

/**
 * Function to add new user.
 */
export async function addUser(email: string) {
    await db.insert(users).values({ email }).execute();
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
}

/**
 * Fucntion to get basic user info.
 */
export async function getUser(userId: number) {
    const [userRecords] = await db
        .select({
            userId: users.id,
            userEmail: users.email,
            userName: userNames.name,
        })
        .from(users)
        .leftJoin(userNames, eq(users.id, userNames.userId))
        .where(and(isNotNull(users.email), eq(users.id, userId)))
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
        })
        .from(users)
        .where(eq(users.email, userEmail))
        .limit(1);

    return user;
}

/**
 * Function to get user info for authentication.
 */
export async function getUserAuthInfo(userEmail: string) {
    const [userRecords] = await db
        .select({
            id: users.id,
            email: users.email,
            activated: users.activated,
            password: userPasswords.password,
        })
        .from(users)
        .leftJoin(userPasswords, eq(users.id, userPasswords.userId))
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
        .select({ boardUUID: boards.boardUUID })
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
        .select({ boardUUID: boards.boardUUID, title: boards.boardName, isPublic: boards.isPublic })
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
        .select({ boardUUID: boards.boardUUID })
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
        .returning({ userId: users.id, userEmail: users.email })
        .execute();

    return userRecords;
}
