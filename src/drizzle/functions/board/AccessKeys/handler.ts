import { and, eq } from "drizzle-orm";
import { db } from "drizzle/db";
import { boardAccessKeys, boardEditLink, boardViewLink, boards } from "drizzle/entities";
import { AccessKeyType } from "./types";
import { getBoardId } from "../Boards/handler";

/**
 * A function to generate board link by link type
 * @returns linkUUID
 */
export async function createAccessKey(boardId: number, keyType: AccessKeyType) {
    const record = await db.insert(boardAccessKeys).values({ boardId, keyType }).returning();

    return record[0];
}

/**
 * A function to delete board link
 */
export async function deleteAccessKey(keyUUID: string) {
    await db.delete(boardAccessKeys).where(eq(boardAccessKeys.keyUUID, keyUUID)).execute();
}

export async function deleteBoardLink(boardUUID: string, linkUUID: string) {
    const boardId = await getBoardId(boardUUID);

    await db
        .delete(boardEditLink)
        .where(and(eq(boardEditLink.boardId, boardId), eq(boardEditLink.editLinkUUID, linkUUID)))
        .execute();
}

export async function getAccessKey(keyUUID: string) {
    const records = await db
        .select({ keyUUID: boardAccessKeys.keyUUID, keyType: boardAccessKeys.keyType, boardUUID: boards.uniqId })
        .from(boardAccessKeys)
        .innerJoin(boards, eq(boards.id, boardAccessKeys.boardId))
        .where(eq(boardAccessKeys.keyUUID, keyUUID));
    return records[0];
}

export async function createBoardByLinkType(boardUUID: string, linkType: string, linkUUID: string) {
    const boardId = await getBoardId(boardUUID);

    switch (linkType) {
        case "edit":
            return await createBoardEditLink(boardId, linkUUID);

        case "view":
            return await createBoardViewLink(boardId, linkUUID);

        default:
            throw new Error("Invalid link type");
    }
}

/**
 * Function to generate a edit link for a board
 * @returns editUUID
 */
export async function createBoardEditLink(boardId: number, linkUUID: string) {
    await db.insert(boardEditLink).values({ boardId: boardId, editLinkUUID: linkUUID }).execute();
}

/**
 * Function to generate a view link for a board
 * @returns viewUUID
 */
export async function createBoardViewLink(boardId: number, linkUUID: string) {
    await db.insert(boardViewLink).values({ boardId: boardId, viewLinkUUID: linkUUID }).execute();
}

/**
 * Function to get the edit link for a board
 * @returns editLinkUUID.
 */
// export async function getBoardLink(boardUUID: string) {
//     const result = await db
//         .select({ editLinkUUID: boardEditLink.editLinkUUID })
//         .from(boardEditLink)
//         .innerJoin(boards, eq(boardEditLink.boardId, boards.id))
//         .where(eq(boards.boardUUID, boardUUID))
//         .execute();

//     if (result.length === 0) {
//         throw new Error(`Could not find edit link by ${boardUUID} boardUUID`);
//     }

/**
 * Function to get the view link for a board
 * @returns viewLinkUUID.
 */
export async function getBoardViewLink(boardUUID: string) {
    const result = await db
        .select({ viewLinkUUID: boardViewLink.viewLinkUUID })
        .from(boardViewLink)
        .innerJoin(boards, eq(boardViewLink.boardId, boards.id))
        .where(eq(boards.uniqId, boardUUID))
        .execute();

    if (result.length === 0) {
        throw new Error(`Could not find view link by ${boardUUID} boardUUID`);
    }

    return result[0].viewLinkUUID;
}

/**
 * Function to get a link info.
 * @returns if link exist return object. Keys: boardId, linkUUID, linkType.
 */
export async function getBoardLink(linkUUID: string) {
    let linkType: AccessKeyType = AccessKeyType.EDIT;
    let [record] = await db
        .select({ boardId: boardEditLink.boardId })
        .from(boardEditLink)
        .where(eq(boardEditLink.editLinkUUID, linkUUID))
        .execute();

    if (!record) {
        linkType = AccessKeyType.VIEW;
        [record] = await db
            .select({ boardId: boardViewLink.boardId })
            .from(boardViewLink)
            .where(eq(boardViewLink.viewLinkUUID, linkUUID))
            .execute();
    }

    if (record) {
        return { boardId: record.boardId, linkUUID: linkUUID, linkType };
    }
}
