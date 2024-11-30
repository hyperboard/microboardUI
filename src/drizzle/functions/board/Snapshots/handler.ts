import { desc, eq } from "drizzle-orm";
import { db } from "drizzle/db";
import { boardSnapshots } from "drizzle/entities";
import { getBoardByLink } from "../Boards";

/**
 * Function to create a board snapshot.
 */
export async function createBoardSnapshot(boardUUID: string, snapshot: string, lastEvent: number) {
    const board = await getBoardByLink(boardUUID);

    const boardId = board?.id;

    if (!boardId) {
        throw new Error(`Board UUID, Edit Link UUID, or View Link UUID does not exist`);
    }

    await db
        .insert(boardSnapshots)
        .values({ boardId: boardId, snapshot: snapshot, lastEventOrder: lastEvent })
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
        .where(eq(boardSnapshots.boardId, boardId))
        .orderBy(desc(boardSnapshots.boardId))
        .limit(1);

    return latestSnapshot[0]?.snapshot ? latestSnapshot[0].snapshot : [];
}

/**
 * Function to save board snapshot.
 */
export async function saveBoardSnapshot(boardOrEditLinkUUID: string, snapshot: string, lastEvent: number) {
    const board = await getBoardByLink(boardOrEditLinkUUID);

    const boardId = board?.id;

    if (!boardId) {
        throw new Error(`Board UUID, Edit Link UUID, or View Link UUID does not exist`);
    }

    await db
        .update(boardSnapshots)
        .set({ snapshot: snapshot, lastEventOrder: lastEvent })
        .where(eq(boardSnapshots.boardId, boardId))
        .execute();
}
