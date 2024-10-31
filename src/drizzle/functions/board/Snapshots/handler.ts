import { desc, eq } from "drizzle-orm";
import { getBoardId, getBoardByLink } from "../Boards";
import { db } from "drizzle/db";
import { boardEditLink, boardSnapshots, boardViewLink } from "drizzle/entities";

/**
 * Function to create a board snapshot.
 */
export async function createBoardSnapshot(boardUUID: string, snapshot: string, lastEvent: number) {
    await db
        .insert(boardSnapshots)
        .values({ boardUUID: boardUUID, snapshot: snapshot, lastEventOrder: lastEvent })
        .execute();
}

/**
 * Function to get last board snapshot.
 * @returns snapshot.
 */
export async function getLatestBoardSnapshot(boardOrLinkUUID: string) {
    const board = await getBoardByLink(boardOrLinkUUID);

    const boardId = board?.id;

    if (!boardId) {
        throw new Error(`Board UUID, Edit Link UUID, or View Link UUID does not exist`);
    }

    // почему бы не группировать по boardId и там уже делать сортировку по дате,
    // если задача состоит в том чтобы извлечь последний (я так понимаю по времени snapshot)?
    const latestSnapshot = await db
        .select({ snapshot: boardSnapshots.snapshot })
        .from(boardSnapshots)
        .where(eq(boardSnapshots.boardUUID, boardOrLinkUUID))
        .orderBy(desc(boardSnapshots.boardUUID))
        .limit(1);

    return latestSnapshot ? latestSnapshot[0]?.snapshot || [] : [];
}

/**
 * Function to save board snapshot.
 */
export async function saveBoardSnapshot(boardOrEditLinkUUID: string, snapshot: string, lastEvent: number) {
    let boardId = await getBoardId(boardOrEditLinkUUID);

    if (!boardId) {
        const boardRecords = await db
            .select({ boardId: boardEditLink.boardId })
            .from(boardEditLink)
            .where(eq(boardEditLink.editLinkUUID, boardOrEditLinkUUID))
            .execute();

        boardId = boardRecords[0].boardId || boardId;
    }

    if (!boardId) {
        throw new Error(`Board UUID, Edit Link UUID does not exist`);
    }

    await db
        .update(boardSnapshots)
        .set({ snapshot: snapshot, lastEventOrder: lastEvent })
        .where(eq(boardSnapshots.boardUUID, boardOrEditLinkUUID))
        .execute();
}
