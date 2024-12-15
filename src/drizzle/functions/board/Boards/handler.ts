import { and, desc, eq, exists, max, not, notInArray, or, sql } from "drizzle-orm";
import { db } from "drizzle/db";
import {
    boardEditLink,
    boardOwner,
    boardPermissions,
    boards,
    boardViewLink,
    userEditLink,
    userViewLink,
} from "drizzle/entities";
import { DirectAccessType, userBoardId } from "drizzle/entities/boards";
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
        .values({ uniqId: newBoardUUID, title: "New Board" })
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
            title: boardName,
            authorUUID: authorUUID,
            isPublic: true,
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

export async function getBoardOwner(boardUUID: string) {
    try {
        const records = await db
            .select({ ownerId: boardOwner.ownerId, boardUUID: boards.uniqId })
            .from(boardOwner)
            .innerJoin(boards, eq(boardOwner.boardId, boards.id))
            .where(eq(boards.uniqId, boardUUID));

        return records[0];
    } catch (err) {
        console.log(err);
    }
}

/**
 * Function to get board by link uuid.
 * @returns boardId.
 */
export async function getBoardId(boardUUID: string) {
    const [boardRecords] = await db
        .select({
            id: boards.id,
        })
        .from(boards)
        .leftJoin(boardEditLink, eq(boards.id, boardEditLink.boardId))
        .leftJoin(boardViewLink, eq(boards.id, boardViewLink.boardId))
        .where(
            or(
                eq(boardEditLink.editLinkUUID, boardUUID),
                eq(boardViewLink.viewLinkUUID, boardUUID),
                eq(boards.uniqId, boardUUID)
            )
        )
        .limit(1);

    if (!boardRecords) {
        throw new Error(`Board not found with UUID ${boardUUID}`);
    }

    return boardRecords.id;
}

export async function getBoardById(boardId: number) {
    const [boardRecords] = await db.select().from(boards).where(eq(boards.id, boardId)).limit(1).execute();

    if (!boardRecords) {
        throw new Error(`Could not find board by ${boardId} id`);
    }

    return boardRecords;
}

export const getBoardByLink = async (link: string) => {
    try {
        const result = await db
            .select({
                id: boards.id,
                boardUUID: boards.uniqId,
                created: boards.createdAt,
                title: boards.title,
                isPublic: boards.isPublic,
                type: boards.directAccessType,
            })
            .from(boards)
            .leftJoin(boardEditLink, eq(boards.id, boardEditLink.boardId))
            .leftJoin(boardViewLink, eq(boards.id, boardViewLink.boardId))
            .where(
                or(eq(boardEditLink.editLinkUUID, link), eq(boardViewLink.viewLinkUUID, link), eq(boards.uniqId, link))
            )
            .limit(1);

        if (result.length === 0) {
            return null;
        }

        return result[0];
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
    const [boardRecords] = await db.select().from(boards).where(eq(boards.uniqId, boardUUID)).limit(1).execute();

    if (!boardRecords) {
        throw new Error(`Could not find board by ${boardUUID} UUID`);
    }

    return boardRecords;
}

/**
 * Function to get private boards for user.
 * @returns boardRecords.
 */
export async function getUserOwnedBoards(userId: number) {
    const boardRecords = await db
        .select({
            id: boards.id,
            title: boards.title,
            isPublic: boards.isPublic,
            createdAt: boards.createdAt,
            authorUUID: boards.authorUUID,
            directAccessType: boards.directAccessType,
            uniqId: boards.uniqId,
        })
        .from(boards)
        .innerJoin(boardOwner, eq(boards.id, boardOwner.boardId))
        .where(eq(boardOwner.ownerId, userId))
        .execute();

    return boardRecords;
}

/**
 * Function to get has rights boards for user.
 * @returns boardRecords.
 */
export async function getUserHasRightsBoards(userId: number) {
    const boardRecords = await db
        .select({
            id: boards.id,
            title: boards.title,
            isPublic: boards.isPublic,
            createdAt: boards.createdAt,
            authorUUID: boards.authorUUID,
            directAccessType: boards.directAccessType,
            uniqId: boards.uniqId,
        })
        .from(boards)
        .innerJoin(boardPermissions, eq(boardPermissions.userId, userId))
        .execute();

    return boardRecords;
}

/**
 * Function to delete a board from the database.
 */
export async function deleteBoard(boardUUID: string) {
    const board = await getBoardByLink(boardUUID);
    if (!board) {
        return;
    }
    await db.delete(boards).where(eq(boards.id, board.id)).execute();
}

/**
 * Function to create duplicate record and table from original board.
 * @returns [originalBoardId, newBoardId].
 */
export async function duplicateBoard(boardUUID: string, appendTitle: string = "(Copy)") {
    const originalBoardRecord = await getBoardByLink(boardUUID);

    if (!originalBoardRecord) {
        throw new Error("Original board does not exist");
    }

    const newBoard = await createBoard(`${originalBoardRecord.title} ${appendTitle}`);
    const newBoardId = newBoard.id;
    const query = sql.raw(
        `insert into board_events (board_id, event_id, event_body) select ${newBoardId}, event_id, event_body from board_events where board_id = ${originalBoardRecord.id}`
    );
    await db.execute(query);

    return newBoardId;
}

/**
 * Function to rename a board.
 * @returns boardId.
 */
export async function renameBoard(boardUUID: string, newTitle: string) {
    const [updateRecords] = await db
        .update(boards)
        .set({ title: newTitle })
        .where(eq(boards.uniqId, boardUUID))
        .returning()
        .execute();

    if (!updateRecords) {
        throw new Error(`Board not found with UUID ${boardUUID}`);
    }

    return updateRecords.id;
}

export async function changeAccessType(boardUUID: string, accessType: DirectAccessType) {
    const [updateRecords] = await db
        .update(boards)
        .set({ directAccessType: accessType })
        .where(eq(boards.uniqId, boardUUID))
        .returning()
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
        .select({ boardId: boards.id })
        .from(boards)
        .where(and(eq(boards.uniqId, boardUUID), eq(boards.authorUUID, authorUUID)))
        .execute();

    if (!boardRecords) {
        throw new Error(`Board not found with ID ${boardUUID} and authorUUID ${authorUUID}`);
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
            uniqId: boards.uniqId,
            title: boards.title,
            isPublic: boards.isPublic,
        })
        .from(boards)
        .innerJoin(boardOwner, eq(boards.id, boardOwner.boardId))
        .where(eq(boardOwner.ownerId, ownerId))
        .orderBy(desc(boards.createdAt));

    return result;
}

export async function getBoardsUserCanView(userId: number) {
    const result = await db
        .select({
            uniqId: boards.uniqId,
            id: boards.id,
            boardname: boards.title,
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
        .orderBy(desc(boards.createdAt)); // Sort by the created field

    return result;
}

export async function getBoardsUserCanEdit(userId: number) {
    const result = await db
        .select({
            uniqId: boards.uniqId,
            id: boards.id,
            boardname: boards.title,
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
        .orderBy(desc(boards.createdAt));

    return result;
}

export async function getUserBoardIds(userId: number) {
    const authoredBoards = await db
        .select({ uniqId: boards.uniqId })
        .from(boards)
        .innerJoin(boardOwner, eq(boards.id, boardOwner.boardId))
        .where(eq(boardOwner.ownerId, userId));

    const authoredBoardIds = authoredBoards.filter((b) => b.uniqId).map<string>((board) => board.uniqId!);

    const canEditBoards = await db
        .select({ uniqId: boards.uniqId })
        .from(boards)
        .innerJoin(boardPermissions, eq(boards.id, boardPermissions.boardId))
        .where(
            and(
                eq(boardPermissions.userId, userId),
                eq(boardPermissions.canEdit, true),
                notInArray(boards.uniqId, authoredBoardIds)
            )
        );

    const canViewBoards = await db
        .select({ uniqId: boards.uniqId })
        .from(boards)
        .innerJoin(boardPermissions, eq(boards.id, boardPermissions.boardId))
        .where(
            and(
                eq(boardPermissions.userId, userId),
                eq(boardPermissions.canView, true),
                notInArray(boards.uniqId, authoredBoardIds)
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
        .where(eq(boards.uniqId, boardUUID))
        .limit(1);

    return !!board?.isPublic;
}

export async function getSharedLinks(userId: number) {
    const sharedEditLinks = await db
        .select({
            id: userEditLink.editLinkUUID,
            boardname: boards.uniqId,
            isPublic: boards.isPublic,
        })
        .from(userEditLink)
        .innerJoin(boardEditLink, eq(userEditLink.editLinkUUID, boardEditLink.editLinkUUID))
        .innerJoin(boards, eq(boardEditLink.boardId, boards.id))
        .where(eq(userEditLink.userId, userId));

    const sharedViewLinks = await db
        .select({
            id: userViewLink.viewLinkUUID,
            boardname: boards.title,
            isPublic: boards.isPublic,
        })
        .from(userViewLink)
        .innerJoin(boardViewLink, eq(userViewLink.viewLinkUUID, boardViewLink.viewLinkUUID))
        .innerJoin(boards, eq(boardViewLink.boardId, boards.id))
        .where(eq(userViewLink.userId, userId));

    const sharedBoardIds = await db
        .select({
            id: userBoardId.boardUuid,
            boardname: boards.title,
            isPublic: boards.isPublic,
        })
        .from(userBoardId)
        .innerJoin(boards, eq(userBoardId.boardUuid, boards.uniqId))
        .where(eq(userBoardId.userId, userId));

    return [...sharedEditLinks, ...sharedViewLinks, ...sharedBoardIds];
}
