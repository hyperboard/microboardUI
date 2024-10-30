import { and, desc, eq, exists, max, not, or, sql, notInArray } from "drizzle-orm";
import { db } from "drizzle/db";
import {
    boardEditLink,
    boardEvents,
    boardOwner,
    boardPermissions,
    boards,
    boardViewLink,
    userEditLink,
    userViewLink,
    userBoardId,
} from "drizzle/entities";
import { v4 as uuid } from "uuid";
// import { createEventsTable } from "../Events";

/**
 * Function to add a new board to the database.
 * Calls addBoardRecord to create a new board record and get its id to call addBoardTable.
 * @returns boardId.
 */
export async function addNewBoard() {
    const boardId = await addNewBoardRecord();

    return boardId;
}

/**
 * Function made a record about a new board in the boards table.
 * @returns boardId.
 */
async function addNewBoardRecord() {
    const newBoardUUID = uuid();

    const [result] = await db
        .insert(boards)
        .values({ boardUUID: newBoardUUID, boardName: "New Board" })
        .returning({ id: boards.id })
        .execute();

    return result.id;
}

/**
 * Function to create a board with board events table.
 * ## Example
 * ```ts
 * import * as Drizzle from 'drizzle';
 * const boardId = await Drizzle.createBoard('boardUUID', 'New Board', 'authorUUID');
 * ```
 */
export async function createBoard(boardName: string, authorUUID?: string) {
    const [insertedRecords] = await db
        .insert(boards)
        .values({
            boardName: boardName,
            authorUUID: authorUUID,
            isPublic: true
        })
        .returning()
        .execute();

    return insertedRecords;
}

/**
 * Function to create private board.
 * @returns boardUUID.
 */
export async function createPrivateBoard(boardName: string, ownerId: number) {
    const createdBoard = await createBoard(boardName);
    if (!createdBoard) {
        throw new Error(`Could not create private board. Error creating basic board`);
    }

    await db.insert(boardOwner).values({ boardId: createdBoard.id, ownerId: ownerId }).execute();

    const [insertedBoard] = await db
        .insert(boardPermissions)
        .values({ boardId: createdBoard.id, userId: ownerId, canView: true, canEdit: true })
        .returning();

    return createdBoard;
}

/**
 * Function to get board id by uuid.
 * @returns boardId.
 */
export async function getBoardId(boardUUID: string) {
    const [boardRecords] = await db
        .select({ id: boards.id })
        .from(boards)
        .where(eq(boards.boardUUID, boardUUID))
        .execute();

    if (!boardRecords) {
        throw new Error(`Board not found with UUID ${boardUUID}`);
    }

    return boardRecords.id;
}

export async function getBoardById(boardId: number) {
    const [boardRecords] = await db
        .select({
            boardUUID: boards.boardUUID,
            createdAt: boards.created,
            boardName: boards.boardName,
        })
        .from(boards)
        .where(eq(boards.id, boardId))
        .limit(1)
        .execute();

    if (!boardRecords) {
        throw new Error(`Could not find board by ${boardId} id`);
    }

    return boardRecords;
}

export const getBoardByLink = async (link: string) => {
    try {
        const result = await db
            .select({
                boardId: boards.id,
                boardUUID: boards.boardUUID,
                created: boards.created,
                title: boards.boardName,
            })
            .from(boards)
            .leftJoin(boardEditLink, eq(boards.id, boardEditLink.boardId))
            .leftJoin(boardViewLink, eq(boards.id, boardViewLink.boardId))
            .where(or(eq(boardEditLink.editLinkUUID, link), eq(boardViewLink.viewLinkUUID, link), eq(boards.boardUUID, link)))
            .limit(1);

        if (result.length === 0) {
            return null;
        }

        const [boardRecords] = await db
            .select()
            .from(boards)
            .where(eq(boards.boardUUID, result[0].boardUUID))
            .limit(1)
            .execute();

        if (!boardRecords) {
            throw new Error(`Could not find board by ${result[0].boardUUID} UUID`);
        }

        return boardRecords;
    } catch (error) {
        console.error(`Error getting board by link: ${error}`);
        return null;
    }
};

/**
 * Function to get board info.
 * @returns board
 */
export async function getBoardInfo(boardUUID: string) {
    const [boardRecords] = await db.select().from(boards).where(eq(boards.boardUUID, boardUUID)).limit(1).execute();

    if (!boardRecords) {
        throw new Error(`Could not find board by ${boardUUID} UUID`);
    }

    return boardRecords;
}

/**
 * Function to get private boards for user.
 * @returns boardRecords.
 */
export async function getPrivateBoards(userId: number) {
    const boardRecords = await db
        .select({ get_private_boards: boards.boardUUID })
        .from(boards)
        .innerJoin(boardPermissions, eq(boards.id, boardPermissions.boardId))
        .where(
            and(
                eq(boardPermissions.userId, userId),
                or(eq(boardPermissions.canView, true), eq(boardPermissions.canEdit, true))
            )
        )
        .execute();

    if (boardRecords.length === 0) {
        throw new Error(`Could not find boards by ${userId} userId`);
    }

    return boardRecords;
}

/**
 * Function to retrieve a board's details by edit link.
 * @returns board.
 */
export async function getBoardByEditLink(editLinkUUID: string) {
    return await db
        .select({
            boardId: boards.id,
            created: boards.created,
            boardname: boards.boardName,
        })
        .from(boards)
        .innerJoin(boardEditLink, eq(boards.id, boardEditLink.boardId))
        .where(eq(boardEditLink.editLinkUUID, editLinkUUID))
        .execute();
}

/**
 * Function to retrieve a board's details by view link.
 * @returns board.
 */
export async function getBoardByViewLink(viewLinkUUID: string) {
    return await db
        .select({
            boardId: boards.id,
            created: boards.created,
            boardName: boards.boardName,
        })
        .from(boards)
        .innerJoin(boardViewLink, eq(boards.id, boardViewLink.boardId))
        .where(eq(boardViewLink.viewLinkUUID, viewLinkUUID))
        .execute();
}

/**
 * Function to delete a board from the database.
 */
export async function deleteBoard(boardUUID: string) {
    const boardId = await getBoardId(boardUUID);

    await db.delete(boards).where(eq(boards.id, boardId)).execute();

    // await db.transaction(async (tx) => {
    // 	await tx.delete(boardPermissions)
    // 		.where(eq(boardPermissions.boardId, boardId))
    // 		.execute();
    // 	await tx.delete(boardOwner)
    // 		.where(eq(boardOwner.boardId, boardId))
    // 		.execute();
    // 	await tx.delete(userEditLink)
    // 		.where(eq(userEditLink.editLinkUUID, boardEditLink.editLinkUUID))
    // 		.execute();
    // 	await tx.delete(userViewLink)
    // 		.where(eq(userViewLink.viewLinkUUID, boardViewLink.viewLinkUUID))
    // 		.execute();
    // 	await tx.delete(boardEditLink)
    // 		.where(eq(boardEditLink.boardId, boardId))
    // 		.execute();
    // 	await tx.delete(boardViewLink)
    // 		.where(eq(boardViewLink.boardId, boardId))
    // 		.execute();
    // 	await tx.delete(boardSnapshots)
    // 		.where(eq(boardSnapshots.boardUUID, boardUUID))
    // 		.execute();
    // 	await tx.delete(boards)
    // 		.where(eq(boards.id, boardId))
    // 		.execute();
    // });
}

/**
 * Function to create duplicate record and table from original board.
 * @returns [originalBoardId, newBoardId].
 */
export async function duplicateBoard(originalBoardUUID: string, newBoardUUID: string) {
    const [originalBoardRecords] = await db
        .select()
        .from(boards)
        .where(eq(boards.boardUUID, originalBoardUUID))
        .execute();

    if (!originalBoardRecords) {
        throw new Error("Original board does not exist");
    }

    await createBoard(newBoardUUID, `${originalBoardRecords.boardName} (Copy)`);

    const originalBoardId = originalBoardRecords.id;
    const newBoardId = await getBoardId(newBoardUUID);

    const query = sql.raw(
        `insert into board_events (board_id, event_id, event_body) select ${newBoardId}, event_id, event_body from board_events where board_id = ${originalBoardId}`
    );
    await db.execute(query);

    return [originalBoardId, newBoardId];
}

/**
 * Function to rename a board.
 * @returns boardId.
 */
export async function renameBoard(boardUUID: string, newBoardName: string) {
    const [updateRecords] = await db
        .update(boards)
        .set({ boardName: newBoardName })
        .where(eq(boards.boardUUID, boardUUID))
        .returning({ id: boards.id })
        .execute();

    if (!updateRecords) {
        throw new Error(`Board not found with UUID ${boardUUID}`);
    }

    return updateRecords.id;
}

/**
 * Funciton to check does board author exist.
 * @returns boolean.
 */
export async function checkBoardAuthor(boardUUID: string, authorUUID: string) {
    const [boardRecords] = await db
        .select({ boardUUID: boards.boardUUID })
        .from(boards)
        .where(and(eq(boards.boardUUID, boardUUID), eq(boards.authorUUID, authorUUID)))
        .execute();

    if (!boardRecords) {
        throw new Error(`Board not found with UUID ${boardUUID} and authorUUID ${authorUUID}`);
    }

    return true;
}

/**
 *
 */
export async function getMaxBoardId() {
    const [maxIdResult] = await db
        .select({ max: max(boards.id) })
        .from(boards)
        .execute();

    return maxIdResult.max || 0;
}

export async function getAuthoredBoards(ownerId: number) {
    const result = await db
        .select({
            uniqId: boards.boardUUID,
            title: boards.boardName,
            isPublic: boards.isPublic,
        })
        .from(boards)
        .innerJoin(boardOwner, eq(boards.id, boardOwner.boardId))
        .where(eq(boardOwner.ownerId, ownerId))
        .orderBy(desc(boards.created));

    return result;
}

export async function getBoardsUserCanView(userId: number) {
    const result = await db
        .select({
            uniqId: boards.boardUUID,
            id: boards.id,
            boardname: boards.boardName,
            isPublic: boards.isPublic,
        })
        .from(boards)
        .innerJoin(boardPermissions, eq(boards.id, boardPermissions.boardId))
        .where(
            and(
                eq(boardPermissions.userId, userId),
                eq(boardPermissions.canView, true),
                not(
                    exists(
                        db
                            .select()
                            .from(boardOwner)
                            .where(and(eq(boardOwner.boardId, boards.id), eq(boardOwner.ownerId, userId)))
                    )
                )
            )
        )
        .orderBy(desc(boards.created)); // Sort by the created field

    return result;
}

export async function getBoardsUserCanEdit(userId: number) {
    const result = await db
        .select({
            uniqId: boards.boardUUID,
            id: boards.id,
            boardname: boards.boardName,
            isPublic: boards.isPublic,
        })
        .from(boards)
        .innerJoin(boardPermissions, eq(boards.id, boardPermissions.boardId))
        .where(
            and(
                eq(boardPermissions.userId, userId),
                eq(boardPermissions.canEdit, true),
                not(
                    exists(
                        db
                            .select()
                            .from(boardOwner)
                            .where(and(eq(boardOwner.boardId, boards.id), eq(boardOwner.ownerId, userId)))
                    )
                )
            )
        )
        .orderBy(desc(boards.created));

    return result;
}

export async function getUserBoardIds(userId: number) {
    const authoredBoards = await db
        .select({ uniqId: boards.boardUUID })
        .from(boards)
        .innerJoin(boardOwner, eq(boards.id, boardOwner.boardId))
        .where(eq(boardOwner.ownerId, userId));

    const authoredBoardIds = authoredBoards.filter((b) => b.uniqId).map<string>((board) => board.uniqId!);

    const canEditBoards = await db
        .select({ uniqId: boards.boardUUID })
        .from(boards)
        .innerJoin(boardPermissions, eq(boards.id, boardPermissions.boardId))
        .where(
            and(
                eq(boardPermissions.userId, userId),
                eq(boardPermissions.canEdit, true),
                notInArray(boards.boardUUID, authoredBoardIds)
            )
        );

    const canViewBoards = await db
        .select({ uniqId: boards.boardUUID })
        .from(boards)
        .innerJoin(boardPermissions, eq(boards.id, boardPermissions.boardId))
        .where(
            and(
                eq(boardPermissions.userId, userId),
                eq(boardPermissions.canView, true),
                notInArray(boards.boardUUID, authoredBoardIds)
            )
        );

    return [
        ...authoredBoards.map((board) => ({
            authoredBoards: board.uniqId,
            canEditBoards: null,
            canViewBoards: null,
        })),
        ...canEditBoards.map((board) => ({
            authoredBoards: null,
            canEditBoards: board.uniqId,
            canViewBoards: null,
        })),
        ...canViewBoards.map((board) => ({
            authoredBoards: null,
            canEditBoards: null,
            canViewBoards: board.uniqId,
        })),
    ];
}

export async function getBoardIsPublic(boardUUID: string): Promise<boolean> {
    const [board] = await db
        .select({ isPublic: boards.isPublic })
        .from(boards)
        .where(eq(boards.boardUUID, boardUUID))
        .limit(1);

    return !!board?.isPublic;
}

export async function getSharedLinks(userId: number) {
    const sharedEditLinks = await db
        .select({
            id: userEditLink.editLinkUUID,
            boardname: boards.boardName,
            isPublic: boards.isPublic,
        })
        .from(userEditLink)
        .innerJoin(boardEditLink, eq(userEditLink.editLinkUUID, boardEditLink.editLinkUUID))
        .innerJoin(boards, eq(boardEditLink.boardId, boards.id))
        .where(eq(userEditLink.userId, userId));

    const sharedViewLinks = await db
        .select({
            id: userViewLink.viewLinkUUID,
            boardname: boards.boardName,
            isPublic: boards.isPublic,
        })
        .from(userViewLink)
        .innerJoin(boardViewLink, eq(userViewLink.viewLinkUUID, boardViewLink.viewLinkUUID))
        .innerJoin(boards, eq(boardViewLink.boardId, boards.id))
        .where(eq(userViewLink.userId, userId));

    const sharedBoardIds = await db
        .select({
            id: userBoardId.boardUuid,
            boardname: boards.boardName,
            isPublic: boards.isPublic,
        })
        .from(userBoardId)
        .innerJoin(boards, eq(userBoardId.boardUuid, boards.boardUUID))
        .where(eq(userBoardId.userId, userId));

    return [...sharedEditLinks, ...sharedViewLinks, ...sharedBoardIds];
}
