import { and, eq } from "drizzle-orm";
import { db } from 'drizzle/db';
import { boardPermissions } from "drizzle/entities";
import { getBoardId } from "../Boards";

/**
 * Function to add user to the board.
 */
export async function addUserPermissions(boardUUID: string, userId: number) {
	const boardId = await getBoardId(boardUUID);

	await db.insert(boardPermissions)
		.values({
			boardId: boardId,
			userId: userId,
			canView: false,
			canEdit: false
		}).execute();
}

/**
 * Function to update board permissions. 
 */
export async function updateBoardPermissions(boardUUID: string, userId: number, canView: boolean, canEdit: boolean) {
	const boardId = await getBoardId(boardUUID);

	await db.update(boardPermissions)
		.set({ canView: canView, canEdit: canEdit })
		.where(and(eq(boardPermissions.boardId, boardId), eq(boardPermissions.userId, userId)))
		.execute();
}

/**
 * Function to get board permissions. 
 * @returns object. Keys: canEdit, canView.
 */
export async function getBoardPermissions(boardUUID: string, userId: number) {
	const boardId = await getBoardId(boardUUID);

	const permissionRecords = await db.select({ canView: boardPermissions.canView, canEdit: boardPermissions.canEdit })
		.from(boardPermissions)
		.where(and(
			eq(boardPermissions.boardId, boardId),
			eq(boardPermissions.userId, userId)
		)).execute();

	if (permissionRecords.length === 0) {
		throw new Error(`Board permissions not found with boardUUID ${boardUUID} and userId ${userId}`);
	}

	return permissionRecords[0];
}

/**
 * Function to grant view permission to a user for a specific board
 */
export async function grantViewPermissions(boardUUID: string, userId: number) {
	const boardId = await getBoardId(boardUUID);

	await db.insert(boardPermissions)
		.values({ boardId: boardId, userId: userId, canView: true })
		.execute();
}

/**
 * Function to grant edit permission to a user for a specific board
 */
export async function grantEditPermissions(boardUUID: string, userId: number) {
	const boardId = await getBoardId(boardUUID);

	await db.insert(boardPermissions)
		.values({ boardId: boardId, userId: userId, canEdit: true })
		.execute();
}

/**
 * Function to revoke all permissions for a user for a specific board
 */
export async function revokePermissions(boardUUID: string, userId: number) {
	const boardId = await getBoardId(boardUUID);

	await db.delete(boardPermissions)
		.where(and(
			eq(boardPermissions.boardId, boardId),
			eq(boardPermissions.userId, userId)
		)).execute();
}

/**
 * Function to check if a user has view permission for a specific board
 * @returns true if user has permission to view, otherwise return false
 */
export async function checkUserViewPermission(boardUUID: string, userId: number): Promise<boolean> {
	const boardId = await getBoardId(boardUUID);

	const permissionRecords = await db.select({ userId: boardPermissions.userId })
		.from(boardPermissions)
		.where(and(
			eq(boardPermissions.boardId, boardId),
			eq(boardPermissions.userId, userId),
			eq(boardPermissions.canView, true)
		)).execute();

	return permissionRecords.length > 0;
}

/**
 * Function to check if a user has edit permission for a specific board
 * @returns true if user has permission to edit, otherwise return false
 */
export async function checkUserEditPermission(boardUUID: string, userId: number) {
	const boardId = await getBoardId(boardUUID);

	const permissionRecords = await db.select({ userId: boardPermissions.userId })
		.from(boardPermissions)
		.where(and(
			eq(boardPermissions.boardId, boardId),
			eq(boardPermissions.userId, userId),
			eq(boardPermissions.canEdit, true)
		)).execute();

	return permissionRecords.length > 0;
}
