import { and, eq } from "drizzle-orm";
import { db } from "drizzle/db";
import { boardEditLink, boardOwner, boards, boardViewLink, userEditLink, userViewLink } from "drizzle/entities";
import { userBoardId } from "drizzle/entities/boards";

/**
 * Function to record a user visiting an edit link if it does not exist.
 */
export async function userVisitedEditLink(userId: number, editLinkUUID: string) {
    const authorRecords = await db
        .select()
        .from(boards)
        .innerJoin(boardEditLink, eq(boardEditLink.boardId, boards.id))
        .innerJoin(boardOwner, eq(boardOwner.boardId, boards.id))
        .where(and(eq(boardEditLink.editLinkUUID, editLinkUUID), eq(boardOwner.ownerId, userId)))
        .execute();

    if (authorRecords.length === 0) {
        return;
    }

    await db.insert(userEditLink).values({ userId: userId, editLinkUUID: editLinkUUID }).execute();
}

/**
 * Function to record a user visiting an view link if it does not exist.
 */
export async function userVisitedViewLink(userId: number, viewLinkUUID: string) {
    const authorRecords = await db
        .select()
        .from(boards)
        .innerJoin(boardViewLink, eq(boardViewLink.boardId, boards.id))
        .innerJoin(boardOwner, eq(boardOwner.boardId, boards.id))
        .where(and(eq(boardViewLink.viewLinkUUID, viewLinkUUID), eq(boardOwner.ownerId, userId)))
        .execute();

    if (authorRecords.length === 0) {
        return;
    }

    await db.insert(userViewLink).values({ userId: userId, viewLinkUUID: viewLinkUUID }).execute();
}

export async function userVisitedBoardId(userId: number, boardUUID: string) {
    const isAuthor = await db
        .select({ id: boards.id })
        .from(boards)
        .innerJoin(boardOwner, eq(boardOwner.boardId, boards.id))
        .where(and(eq(boards.uniqId, boardUUID), eq(boardOwner.ownerId, userId)));

    if (isAuthor.length > 0) {
        return;
    }

    // Insert into userBoardId if not the author
    await db
        .insert(userBoardId)
        .values({
            userId: userId,
            boardUuid: boardUUID,
        })
        .execute();
}

/**
 * Function to record a user visiting a link (edit or view) if it does not exist.
 * @throws
 */
export async function userVisited(userId: number, linkUUID: string) {
    const editLinkVisitedRecords = await db
        .select()
        .from(userEditLink)
        .where(and(eq(userEditLink.userId, userId), eq(userEditLink.editLinkUUID, linkUUID)))
        .execute();

    if (editLinkVisitedRecords.length > 0) {
        return;
    }

    const viewLinkVisitedRecords = await db
        .select()
        .from(userViewLink)
        .where(and(eq(userViewLink.userId, userId), eq(userViewLink.viewLinkUUID, linkUUID)))
        .execute();

    if (viewLinkVisitedRecords.length > 0) {
        return;
    }

    const boardIdVisited = await db
        .select()
        .from(userBoardId)
        .where(and(eq(userBoardId.userId, userId), eq(userBoardId.boardUuid, linkUUID)))
        .execute();

    if (boardIdVisited.length > 0) {
        return;
    }

    const editLink = await db.select().from(boardEditLink).where(eq(boardEditLink.editLinkUUID, linkUUID)).execute();

    if (editLink.length > 0) {
        await userVisitedEditLink(userId, linkUUID);
        return;
    }

    const viewLink = await db.select().from(boardViewLink).where(eq(boardViewLink.viewLinkUUID, linkUUID)).execute();

    if (viewLink.length > 0) {
        await userVisitedViewLink(userId, linkUUID);
        return;
    }

    await userVisitedBoardId(userId, linkUUID);
}

/**
 * Function to delete information that a user visited a link (edit or view).
 * @throws
 */
export async function userUnvisited(userId: number, linkUUID: string) {
    const deletedEdit = await db
        .delete(userEditLink)
        .where(and(eq(userEditLink.userId, userId), eq(userEditLink.editLinkUUID, linkUUID)))
        .returning()
        .execute();

    const deletedView = await db
        .delete(userViewLink)
        .where(and(eq(userViewLink.userId, userId), eq(userViewLink.viewLinkUUID, linkUUID)))
        .returning()
        .execute();

    const deletedBoardId = await db
        .delete(userBoardId)
        .where(and(eq(userBoardId.userId, userId), eq(userBoardId.boardUuid, linkUUID)))
        .returning()
        .execute();

    if (deletedEdit.length === 0 && deletedView.length === 0 && deletedBoardId.length === 0) {
        console.error(`No link found for user_id ${userId} and link_uuid ${linkUUID}`);
        return null;
    }
}

export async function addUserVisitedBoard(userId: number, linkUUID: string) {
    // TODO: fix me
    console.log("not implemented");
}
