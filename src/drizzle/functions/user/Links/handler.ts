import { and, eq } from "drizzle-orm";
import { db } from "drizzle/db";
import { boardEditLink, boardOwner, boards, boardViewLink, userEditLink, userViewLink } from "drizzle/entities";

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

    console.log("authorRecords", authorRecords);

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

    console.log("authorRecords", authorRecords);

    if (authorRecords.length === 0) {
        return;
    }

    await db.insert(userViewLink).values({ userId: userId, viewLinkUUID: viewLinkUUID }).execute();
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

    console.log("editLinkVisitedRecords", editLinkVisitedRecords);

    const viewLinkVisitedRecords = await db
        .select()
        .from(userViewLink)
        .where(and(eq(userViewLink.userId, userId), eq(userViewLink.viewLinkUUID, linkUUID)))
        .execute();

    if (viewLinkVisitedRecords.length > 0) {
        return;
    }

    console.log("viewLinkVisitedRecords", viewLinkVisitedRecords);

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

    throw new Error(`Link ${linkUUID} does not exist`);
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

    if (deletedEdit.length === 0 && deletedView.length === 0) {
        console.error(`No link found for user_id ${userId} and link_uuid ${linkUUID}`);
        return null;
    }
}

export async function getSharedLinksUser(userId: number) {
    const sharedEditLinksQuery = await db
        .select({ editLinkUUID: userEditLink.editLinkUUID })
        .from(userEditLink)
        .where(eq(userEditLink.userId, userId))
        .execute();

    const sharedViewLinksQuery = await db
        .select({ viewLinkUUID: userViewLink.viewLinkUUID })
        .from(userViewLink)
        .where(eq(userViewLink.userId, userId))
        .execute();

    return [
        ...sharedEditLinksQuery.map((link) => link.editLinkUUID!),
        ...sharedViewLinksQuery.map((link) => link.viewLinkUUID!),
    ];
}
