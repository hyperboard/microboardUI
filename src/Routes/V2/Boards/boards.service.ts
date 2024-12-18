import { and, asc, desc, eq, getTableColumns, gt, isNull, or, sql } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { boardEvents, boardOwner, boardPermissions, boards, boardSnapshots, userNames, users } from "drizzle/entities";
import { folders, foldersToBoards, FolderType } from "drizzle/entities/folders";
import { userAvatars } from "drizzle/entities/userAvatars";
import { boardEventDbWriteLatency } from "Metrics/metrics";
import type { BoardEventData } from "Routes/V1/Boards";
import { v4 } from "uuid";
import type winston from "winston";
import { BoardPayload, BoardSnapshotPayload, UserAccessType } from "./types";

export class BoardsService {
    constructor(private readonly db: NodePgDatabase, private readonly logger: winston.Logger) {}

    invalidateBoardRights = (boardUUID: string, byUser: boolean): Promise<void> => {
        throw new Error("Method not implemented");
    };

    setInvalidateBoardRights(fn: (boardUUID: string, byUser: boolean) => Promise<void>) {
        this.invalidateBoardRights = fn;
    }

    async create(newBoard: BoardPayload & { ownerId?: number }) {
        const boardRecord = await this.db.transaction(async (tx) => {
            const authorUUID = newBoard.ownerId ? null : v4();

            const [board] = await tx
                .insert(boards)
                .values({ ...newBoard, authorUUID })
                .returning();

            if (newBoard.ownerId) {
                await tx.insert(boardOwner).values({ boardId: board.id, ownerId: newBoard.ownerId });
            }

            return board;
        });

        return boardRecord;
    }

    async get(boardUUID: string) {
        const [board] = await this.db
            .selectDistinct({ ...getTableColumns(boards), ownerId: boardOwner.boardId })
            .from(boards)
            .leftJoin(boardOwner, eq(boards.id, boardOwner.ownerId))
            .where(eq(boards.uniqId, boardUUID));

        return board;
    }

    async edit(boardId: number, payload: BoardPayload) {
        const [updatedBoard] = await this.db.update(boards).set(payload).where(eq(boards.id, boardId)).returning();

        return updatedBoard;
    }

    async validateAuthor(boardUUID: string, authorUUID: string) {
        const [board] = await this.db
            .selectDistinct()
            .from(boards)
            .where(and(eq(boards.uniqId, boardUUID), eq(boards.authorUUID, authorUUID)));

        return Boolean(board);
    }

    async claim(authorKeys: string[], ownerId: number) {
        await this.db.transaction(async (tx) => {
            const selectQuery = tx
                .select({ id: boards.id })
                .from(boards)
                .leftJoin(boardOwner, eq(boardOwner.boardId, boards.id))
                .where(and(eq(boards.authorUUID, sql.placeholder("authorKey")), isNull(boardOwner.ownerId)))
                .prepare("selectBoardByAuthorKey");

            const boardIds = await Promise.all(
                authorKeys.map(async (key) => {
                    const [board] = await selectQuery.execute({ authorKey: key });

                    return board?.id;
                })
            );

            const filteredIds = boardIds.filter((v) => v);

            if (filteredIds.length > 0) {
                const [draftsFolder] = await tx
                    .select()
                    .from(folders)
                    .where(and(eq(folders.ownerId, ownerId), eq(folders.type, FolderType.DRAFTS)));
                const insertQuery = tx
                    .insert(boardOwner)
                    .values({ boardId: sql.placeholder("boardId"), ownerId })
                    .prepare("setBoardOwner");
                const addBoardDraftsQuery = tx
                    .insert(foldersToBoards)
                    .values({ folderId: draftsFolder.id, containsBoardId: sql.placeholder("boardId") })
                    .prepare("addBoardDrafts");

                await Promise.all(filteredIds.flatMap((id) => insertQuery.execute({ boardId: id })));
                await Promise.all(filteredIds.flatMap((id) => addBoardDraftsQuery.execute({ boardId: id })));

                const resetAuthorKeyQuery = tx
                    .update(boards)
                    .set({ authorUUID: null })
                    .where(eq(boards.id, sql.placeholder("id")))
                    .prepare("resetAuthorKey");

                await Promise.all(filteredIds.map((id) => resetAuthorKeyQuery.execute({ id })));
            }
        });
    }

    async visit(boardUUIDs: string[], userId: number) {
        if (boardUUIDs.length > 0) {
            await this.db.transaction(async (tx) => {
                const [sharedFolder] = await tx
                    .select({ id: folders.id })
                    .from(folders)
                    .where(and(eq(folders.type, FolderType.VISITED), eq(folders.ownerId, userId)));
                const sharedFolderItems = await tx
                    .select({ boardId: boards.uniqId })
                    .from(foldersToBoards)
                    .innerJoin(boards, eq(boards.id, foldersToBoards.containsBoardId))
                    .where(and(eq(foldersToBoards.folderId, sharedFolder.id)));

                const insertQuery = tx
                    .insert(foldersToBoards)
                    .values({ folderId: sharedFolder.id, containsBoardId: sql.placeholder("boardId") })
                    .prepare("addBoardShared");

                const boardIds = await Promise.all(
                    boardUUIDs.map(async (uuid) => {
                        const [board] = await tx
                            .select({ id: boards.id, uniqId: boards.uniqId })
                            .from(boards)
                            .where(eq(boards.uniqId, uuid));
                        return board;
                    })
                );
                await Promise.all(
                    boardIds.map(async (board) => {
                        const isExistsInFolder = sharedFolderItems.find((b) => b.boardId === board?.uniqId);
                        const [isOwned] = await tx
                            .select({ ownerId: boardOwner.ownerId })
                            .from(boardOwner)
                            .where(and(eq(boardOwner.ownerId, userId), eq(boardOwner.boardId, board.id)));
                        if (!isExistsInFolder && !isOwned?.ownerId && board?.id) {
                            await insertQuery.execute({ boardId: board.id });
                        }
                    })
                );
            });
        }
    }

    async remove(boardUUID: string) {
        await this.db.delete(boards).where(eq(boards.uniqId, boardUUID));
    }

    getOwnedBoards(ownerId: number) {
        return this.db
            .select({ id: boards.id })
            .from(boards)
            .leftJoin(boardOwner, eq(boardOwner.boardId, boards.id))
            .where(eq(boardOwner.ownerId, ownerId));
    }

    async saveBoardSnapshot(snapshot: BoardSnapshotPayload) {
        await this.db
            .insert(boardSnapshots)
            .values(snapshot)
            .onConflictDoUpdate({
                target: [boardSnapshots.boardId, boardSnapshots.lastEventOrder],
                set: snapshot,
            });
    }

    async getBoardEvents(boardId: number, afterLogId = 0) {
        const events = await this.db
            .select()
            .from(boardEvents)
            .where(and(eq(boardEvents.boardId, boardId), gt(boardEvents.logId, afterLogId)))
            .orderBy(asc(boardEvents.logId));

        const eventBodies = events.map<{ order: number; body: any }>((event) => ({
            order: parseInt(event.eventId?.split(":")[1] || "0"),
            body: event.eventBody || {},
        }));

        return eventBodies;
    }

    async getLatestBoardSnapshot(boardId: number): Promise<any> {
        const [latestSnapshot] = await this.db
            .select({ snapshot: boardSnapshots.snapshot })
            .from(boardSnapshots)
            .where(eq(boardSnapshots.boardId, boardId))
            .orderBy(desc(boardSnapshots.createdAt))
            .limit(1);

        return (latestSnapshot?.snapshot as any[]) ?? [];
    }

    async getAllBoardLastEventOrders() {
        const extractedValuesQuery = this.db.$with("extracted_values").as(
            this.db
                .select({
                    boardId: boardEvents.boardId,
                    eventId: boardEvents.eventId,
                    integer2Value:
                        sql`CAST((regexp_matches(${boardEvents.eventId}, '(\\d+):(\\d+)'))[2] AS INTEGER)`.as(
                            "integer2Value"
                        ),
                })
                .from(boardEvents)
        );

        const lastOrderPerBoardQuery = this.db.$with("last_order_per_board").as(
            this.db
                .select({
                    boardId: extractedValuesQuery.boardId,
                    lastOrder: sql<number>`MAX(${extractedValuesQuery.integer2Value})`.as("lastOrder"),
                })
                .from(extractedValuesQuery) // Ensure this is correctly referenced
                .groupBy(extractedValuesQuery.boardId)
        );

        const results = await this.db
            .with(extractedValuesQuery, lastOrderPerBoardQuery)
            .select({
                boardUUID: boards.uniqId,
                lastOrder: lastOrderPerBoardQuery.lastOrder,
            })
            .from(boards)
            .leftJoin(lastOrderPerBoardQuery, eq(boards.id, lastOrderPerBoardQuery.boardId)) // Ensure this join is correct
            .groupBy(boards.uniqId, lastOrderPerBoardQuery.lastOrder);

        return results;
    }

    async getEventsCountSinceLastSnapshot(boardUUID: string) {
        const lastSnapshotCTE = this.db
            .$with("last_snapshot")
            .as(
                this.db
                    .select({ last_event_order: boardSnapshots.lastEventOrder })
                    .from(boardSnapshots)
                    .innerJoin(boards, eq(boards.id, boardSnapshots.boardId))
                    .where(eq(boards.uniqId, boardUUID))
                    .orderBy(desc(boardSnapshots.lastEventOrder))
                    .limit(1)
            );

        const parsedEventsCTE = this.db.$with("parsed_events").as(
            this.db
                .select({
                    board_id: boardEvents.boardId,
                    event_order: sql`CAST(split_part(${boardEvents.eventId}, ':', 2) AS INTEGER)`.as("event_order"),
                })
                .from(boardEvents)
                .innerJoin(boards, eq(boards.id, boardEvents.boardId)) // Corrected join condition
                .where(eq(boards.uniqId, boardUUID))
        );

        const eventCountsCTE = this.db.$with("event_counts").as(
            this.db
                .select({
                    last_snapshot_order:
                        sql`COALESCE((SELECT ${lastSnapshotCTE.last_event_order} FROM ${lastSnapshotCTE}), -1)`.as(
                            "last_snapshot_order"
                        ),
                    total_events: sql`COUNT(*)`.as("total_events"),
                    events_since_snapshot:
                        sql`COUNT(CASE WHEN ${parsedEventsCTE.event_order} > COALESCE((SELECT ${lastSnapshotCTE.last_event_order} FROM ${lastSnapshotCTE}), -1) THEN 1 END)`.as(
                            "events_since_snapshot"
                        ),
                })
                .from(parsedEventsCTE)
        );

        const result = await this.db
            .with(lastSnapshotCTE, parsedEventsCTE, eventCountsCTE) // Ensure all CTEs are included
            .select({
                event_count: sql<number>`
          CASE 
            WHEN ${eventCountsCTE.last_snapshot_order} = -1 THEN ${eventCountsCTE.total_events}
            ELSE ${eventCountsCTE.events_since_snapshot}
          END`.as("event_count"),
            })
            .from(eventCountsCTE);

        return result[0]?.event_count || 0;
    }

    async addEvents(boardId: string, events: Array<BoardEventData>) {
        const startDbWrite = process.hrtime.bigint();

        const board = await this.get(boardId);
        if (!board) {
            return;
        }

        const maxLogIdResult = await this.db
            .select({ maxLogId: sql`COALESCE(MAX(${boardEvents.logId}), 0)` })
            .from(boardEvents)
            .where(eq(boardEvents.boardId, board.id))
            .execute();

        const maxLogIdSql = Number(maxLogIdResult[0]?.maxLogId);
        const maxLogId = isNaN(maxLogIdSql) ? 0 : maxLogIdSql;

        let nextLogId = maxLogId + 1;
        await this.db.insert(boardEvents).values(
            events.map((event) => {
                const logId = nextLogId++;
                const eventId = (event.eventId.split(":")[0] || Date.now().toString()) + ":" + event.order;

                return {
                    boardId: board.id,
                    logId,
                    eventId,
                    eventBody: {
                        ...event,
                        eventId,
                    },
                };
            })
        );

        const endDbWrite = process.hrtime.bigint();
        const dbWriteLatency = Number(endDbWrite - startDbWrite);

        try {
            boardEventDbWriteLatency.observe(dbWriteLatency);
        } catch (e) {
            this.logger.error(`Error recording db write latency: ${e}`);
        }
    }

    async grantAccess(boardId: number, users: { userId: number; accessType: UserAccessType }[]) {
        if (users.length === 0) {
            return;
        }
        const payload = users.map((user) => ({
            boardId,
            userId: user.userId,
            canEdit: user.accessType === UserAccessType.EDIT,
            canView: user.accessType !== UserAccessType.NO_ACCESS,
        }));

        await this.db
            .insert(boardPermissions)
            .values(payload)
            .onConflictDoUpdate({
                target: [boardPermissions.boardId, boardPermissions.userId],
                set: {
                    canView: sql.raw(`excluded.${boardPermissions.canView.name}`),
                    canEdit: sql.raw(`excluded.${boardPermissions.canEdit.name}`),
                },
            });
    }

    async getGrantedUsers(boardId: number) {
        const records = await this.db
            .select({
                ...getTableColumns(users),
                name: userNames.name,
                avatar: userAvatars.avatar,
                isOwner: sql<boolean>`false`,
                accessType: sql<UserAccessType>`
        CASE 
            WHEN ${boardPermissions.canEdit} = true THEN 'edit'
            WHEN ${boardPermissions.canView} = true THEN 'view'
          END
        `,
            })
            .from(boardPermissions)
            .innerJoin(users, eq(boardPermissions.userId, users.id))
            .leftJoin(userAvatars, eq(userAvatars.userId, boardPermissions.userId))
            .leftJoin(userNames, eq(userNames.userId, boardPermissions.userId))
            .where(
                and(
                    eq(boardPermissions.boardId, boardId),
                    or(eq(boardPermissions.canView, true), eq(boardPermissions.canEdit, true))
                )
            );

        const owner = await this.db
            .select({
                ...getTableColumns(users),
                name: userNames.name,
                avatar: userAvatars.avatar,
                accessType: sql<UserAccessType>`'edit'`,
                isOwner: sql<boolean>`true`,
            })
            .from(boardOwner)
            .innerJoin(users, eq(boardOwner.ownerId, users.id))
            .leftJoin(userAvatars, eq(userAvatars.userId, users.id))
            .leftJoin(userNames, eq(userNames.userId, users.id))
            .where(eq(boardOwner.boardId, boardId));

        return [...owner, ...records];
    }
}
