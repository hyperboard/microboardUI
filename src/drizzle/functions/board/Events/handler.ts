import { and, asc, eq, gt, sql } from "drizzle-orm";
import { db } from "drizzle/db";
import { boardEditLink, boardEvents, boards } from "drizzle/entities";
import { getBoardId, getBoardByLink } from "../Boards";

/**
 * Function to add a new event at the end of the log of events in a board table.
 * Does not add the event if the event id is already in the table.
 * @returns Returns the offset of the new event.
 */
export async function addBoardEventUsingUUID(boardOrEditLinkUUID: string, eventUUID: string, eventBody: object) {
    return await db.transaction(async (tx) => {
        let boardId = await getBoardId(boardOrEditLinkUUID);

        if (!boardId) {
            const [boardRecords] = await tx
                .select({ boardId: boardEditLink.boardId })
                .from(boardEditLink)
                .where(eq(boardEditLink.editLinkUUID, boardOrEditLinkUUID));

            boardId = boardRecords?.boardId || boardId;
        }

        if (!boardId) {
            throw new Error("Board UUID or Edit Link UUID does not exist");
        }

        // Find the last logId and insert the new event atomically
        const result = await tx
            .insert(boardEvents)
            .values({
                boardId,
                logId: sql`COALESCE((SELECT MAX(log_id) FROM board_events WHERE board_id = ${boardId}), 0) + 1`,
                eventId: eventUUID,
                eventBody,
            })
            .returning();

        return { boardId: result[0].boardId, eventUUID: result[0].eventId, logId: result[0].logId };
    });
}

/**
 * Function to get list events of a board newer than the offset.
 * Takes an id of a board and an offset.
 */
export async function getBoardEvents(boardOrLinkUUID: string, afterLogid: number) {
    const board = await getBoardByLink(boardOrLinkUUID);

    const boardId = board?.id;

    if (!boardId) {
        throw new Error(`Board UUID or Link UUID does not exist`);
    }

    const events = await db
        .select()
        .from(boardEvents)
        .where(and(eq(boardEvents.boardId, board.id), gt(boardEvents.logId, afterLogid)))
        .orderBy(asc(boardEvents.logId));

    return events || [];
}


/**
 * Function to get count of events since last snapshot.
 */
export async function getEventsCountSinceLastSnapshot(boardOrLinkUUID: string) {
    const board = await getBoardByLink(boardOrLinkUUID);

    if (!board) {
        throw new Error(`Board UUID or Link UUID does not exist`);
    }

    const result = await db.execute(sql`
    WITH last_snapshot AS (
    SELECT last_event_order
    FROM board_snapshots
    WHERE board_id = ${board.id}
    ORDER BY last_event_order DESC
    LIMIT 1
    ),
    parsed_events AS (
        SELECT 
            board_id,
            CAST(split_part(event_id, ':', 2) AS INTEGER) AS event_order
        FROM board_events
        WHERE board_id = ${board.id}
    ),
    event_counts AS (
        SELECT 
            COALESCE((SELECT last_event_order FROM last_snapshot), -1) AS last_snapshot_order,
            COUNT(*) AS total_events,
            COUNT(CASE WHEN pe.event_order > COALESCE((SELECT last_event_order FROM last_snapshot), -1) THEN 1 END) AS events_since_snapshot
        FROM parsed_events pe
    )
    SELECT 
        CASE 
            WHEN last_snapshot_order = -1 THEN total_events
            ELSE events_since_snapshot
        END AS event_count
    FROM event_counts
  `);

    const res = result.rows[0]?.event_count;
    return parseInt(res as string);
}

export async function getLastEventOrderForBoard(boardUuid: string): Promise<number> {
    try {
        const [result] = await db
            .select({
                lastOrder: sql<string>`COALESCE(MAX(${boardEvents.logId}), 0)`,
            })
            .from(boardEvents)
            .innerJoin(boards, eq(boards.id, boardEvents.boardId))
            .where(eq(boards.uniqId, boardUuid));

        return parseInt(typeof result?.lastOrder === "string" ? result.lastOrder : "0");
    } catch (error) {
        console.error(`Error getting last event order for board ${boardUuid}: ${error}`);
        throw error;
    }
}
