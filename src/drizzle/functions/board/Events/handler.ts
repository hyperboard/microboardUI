import { eq, and, max, sql, between, asc, gt } from "drizzle-orm";
import { getBoardId, getBoardByLink } from "../Boards";
import { db } from "drizzle/db";
import { getBoardLink } from "../Links";
import { boardEditLink, boardEvents, boards, boardSnapshots } from "drizzle/entities";

/**
 * Function to add a new event at the end of the log of events in a board table.
 * Does not add the event if the event id is already in the table.
 * @returns Returns the offset of the new event.
 */
export async function addBoardEvent(boardId: number, eventUUID: string, eventBody: object) {
    const result = await db.insert(boardEvents).values({ boardId, eventId: eventUUID, eventBody }).returning();

    return { boardId: result[0].boardId, eventUUID: result[0].eventId };
}

/**
 * Function to add a new event at the end of the log of events in a board table.
 * Does not add the event if the event id is already in the table.
 * @returns Returns the offset of the new event.
 */
export async function addBoardEventUsingUUID(boardOrEditLinkUUID: string, eventUUID: string, eventBody: object) {
    let boardId = await getBoardId(boardOrEditLinkUUID);

    if (!boardId) {
        const [boardRecords] = await db
            .select({ boardId: boardEditLink.boardId })
            .from(boardEditLink)
            .where(eq(boardEditLink.editLinkUUID, boardOrEditLinkUUID));

        boardId = boardRecords?.boardId || boardId;
    }

    if (!boardId) {
        throw new Error("Board UUID or Edit Link UUID does not exist");
    }

    return await addBoardEvent(boardId, eventUUID, eventBody);
}

/**
 * Function to get list events of a board newer than the offset.
 * Takes an id of a board and an offset.
 */
export async function getBoardEvents(boardOrLinkUUID: string, afterLogid: number) {
    let board = await getBoardByLink(boardOrLinkUUID);

    let boardId = board?.id || null;

    if (!boardId) {
        const linkRecord = await getBoardLink(boardOrLinkUUID);
        boardId = linkRecord.boardId || boardId;
    }

    if (!boardId) {
        throw new Error(`Board UUID or Link UUID does not exist`);
    }

    const events = await db
        .select()
        .from(boardEvents)
        .where(and(eq(boardEvents.boardId, boardId), gt(boardEvents.logId, afterLogid)))
        .orderBy(asc(boardEvents.logId));

    return events || [];
}

/**
 * Function to get count of events since last snapshot.
 */
export async function getEventsCountSinceLastSnapshot(boardOrLinkUUID: string) {
    let boardId = await getBoardId(boardOrLinkUUID);

    if (!boardId) {
        const boardRecords = await getBoardLink(boardOrLinkUUID);
        boardId = boardRecords.boardId || boardId;
    }

    if (!boardId) {
        throw new Error(`Board UUID or Link UUID does not exist`);
    }

    const sq = db
        .select({ events: max(boardSnapshots.lastEventOrder) })
        .from(boardSnapshots)
        .where(eq(boardSnapshots.boardUUID, boardOrLinkUUID))
        .as("sq");

    const result = await db.execute(sql`
    WITH last_snapshot AS (
    SELECT last_event_order
    FROM board_snapshots
    WHERE board_id = ${boardId}
    ORDER BY last_event_order DESC
    LIMIT 1
    ),
    parsed_events AS (
        SELECT 
            board_id,
            CAST(split_part(event_id, ':', 2) AS INTEGER) AS event_order
        FROM board_events
        WHERE board_id = ${boardId}
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

    return result.rows[0]?.event_count || 0;
}

/**
 * ? no usage
 * ? search boards between startId and endId???
 * FIXME: remove or rewrite
 */
// export async function getBoardLastEventOrders(startId: number, endId: number) {
//     const tempResult: Array<{
//         boardId: number;
//         boardUUID: string | null;
//         boardEditLinkUUIDs: string[];
//         lastOrder: number;
//     }> = [];

//     const result = await db
//         .select({
//             boardId: boards.id,
//             boardUUID: boards.boardUUID,
//             boardEditLinkUUIDs: boardEditLink.editLinkUUID,
//         })
//         .from(boards)
//         .leftJoin(boardEditLink, eq(boardEditLink.boardId, boards.id))
//         .where(between(boards.id, startId, endId))
//         .execute();

//     result.forEach((item) => {
//         if (item.boardId in tempResult) {
//             tempResult[item.boardId].boardEditLinkUUIDs.push(item.boardEditLinkUUIDs || "");
//         } else {
//             tempResult[item.boardId] = {
//                 boardId: item.boardId,
//                 boardUUID: item.boardUUID,
//                 boardEditLinkUUIDs: [item.boardEditLinkUUIDs || ""],
//                 lastOrder: 0,
//             };
//         }
//     });

//     let currentBatch = "";

//     for (let i = startId; i <= endId; i++) {
//         const query = sql.raw(`SELECT 1 from information_schema.tables where table_name = ${"board" + i}`);
//         const result = await db.execute(query);

//         if (result.rows.length > 0) {
//             if (currentBatch !== "") {
//                 currentBatch += " UNION ALL ";
//             }

//             if (i in tempResult) {
//                 currentBatch += sql.raw(`
// 				SELECT ${i} AS boardId, COALESCE(MAX(logid), 0) AS maxLogid FROM board${i}
// 			`);
//             }
//         }
//     }

//     let currentBatchResult = await db.execute(sql`${currentBatch}`);

//     if (currentBatchResult.rows.length > 0) {
//         tempResult.forEach((item) => {
//             item.lastOrder = currentBatchResult.rows[0].maxLogid as number;
//         });
//     }

//     return tempResult;
// }
