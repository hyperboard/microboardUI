import { and, asc, desc, eq, getTableColumns, gt, inArray, isNull, or, sql, notInArray } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { boardEvents, boardOwner, boardPermissions, boards, boardSnapshots, userNames, users } from "drizzle/entities";
import { folders, foldersToBoards, FolderType } from "drizzle/entities/folders";
import { userAvatars } from "drizzle/entities/userAvatars";
import { boardEventDbWriteLatency } from "Metrics/metrics";
import { v4 } from "uuid";
import type winston from "winston";
import { BoardPayload, BoardSnapshotPayload, UserAccessType } from "./types";
import * as Drizzle from "drizzle";
import type { BoardDto } from "./dto";
import { isUUID } from "validator";

export interface BoardEventData {
    eventId: string;
    body: object;
    order: number;
    operation: any;
}

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
        await this.db.transaction(async (tx) => {
            await tx
                .insert(boardSnapshots)
                .values(snapshot)
                .onConflictDoUpdate({
                    target: [boardSnapshots.boardId, boardSnapshots.lastEventOrder],
                    set: snapshot,
                });

            const snapshotsToKeep = await tx
                .select({ id: boardSnapshots.id })
                .from(boardSnapshots)
                .where(eq(boardSnapshots.boardId, Number(snapshot.boardId)))
                .orderBy(desc(boardSnapshots.createdAt))
                .limit(5);

            const snapshotIdsToKeep = snapshotsToKeep.map((s) => s.id);

            await tx
                .delete(boardSnapshots)
                .where(
                    and(
                        eq(boardSnapshots.boardId, Number(snapshot.boardId)),
                        notInArray(boardSnapshots.id, snapshotIdsToKeep)
                    )
                );
        });
    }

    async addEventToBoard(boardId: string, eventId: string, eventBody: object): Promise<{ order: number; body: any }> {
        try {
            this.validateUUID(boardId, "boardId");

            const result = await Drizzle.addBoardEventUsingUUID(boardId, eventId, eventBody);
            const order = result.boardId;
            const event = { order, body: eventBody };

            this.onEventSave(boardId, {
                type: "BoardEvent",
                boardId,
                event,
            });

            return event;
        } catch (error) {
            this.logger.error(`Error adding event to board: ${error}`);
            throw error;
        }
    }

    async addEventsToBoard(boardId: string, events: Array<BoardEventData>): Promise<void> {
        try {
            const startDbWrite = process.hrtime.bigint();
            // Find the board
            const board = await this.get(boardId);
            if (!board) {
                return;
            }
            await this.db
                .insert(boardEvents)
                .values(
                    events.map((event) => {
                        const eventId = (event.eventId.split(":")[0] || Date.now().toString()) + ":" + event.order;
                        return {
                            boardId: board.id,
                            logId: event.order,
                            eventId,
                            eventBody: {
                                ...event,
                                eventId,
                            },
                        };
                    })
                )
                .onConflictDoNothing();

            const endDbWrite = process.hrtime.bigint();
            const dbWriteLatency = Number(endDbWrite - startDbWrite);

            try {
                boardEventDbWriteLatency.observe(dbWriteLatency);
            } catch (e) {
                this.logger.error(`Error recording db write latency: ${e}`);
            }
        } catch (error) {
            console.error(`Error adding events to board: ${error}`);
            throw error;
        }
    }

    async getBoardEvents(boardId: string, offset = 0, page?: number, limit?: number): Promise<any[]> {
        try {
            const events = await Drizzle.getBoardEvents(boardId, offset);

            const eventBodies = events.map<{ order: number; body: any }>((event) => ({
                order: parseInt(event.eventId?.split(":")[1] || "0"),
                body: event.eventBody || {},
            }));

            return eventBodies;
        } catch (error) {
            this.logger.error(`Error retrieving board events: ${error}`);
            throw error;
        }
    }

    async getLatestBoardSnapshot(boardId: string): Promise<any> {
        try {
            // FIXME: proper type
            const result: any[] = (await Drizzle.getLatestBoardSnapshot(boardId)) as any[];

            if (result?.length === 0) {
                // throw new Error(`No snapshot found for board or link UUID ${boardUuidOrEditLink}`);
                return null;
            }

            return result;
        } catch (error) {
            this.logger.error(`Error retrieving latest snapshot for board ${boardId}: ${error}`);
            throw error;
        }
    }

    async getEventCountSinceLastSnapshot(boardId: string): Promise<number> {
        try {
            this.validateUUID(boardId, "boardId");

            const result = await Drizzle.getEventsCountSinceLastSnapshot(boardId);

            return result as number;
        } catch (error) {
            this.logger.error(`Error getting event count since last snapshot for board ${boardId}: ${error}`);
            throw error;
        }
    }

    private validateUUID(id: string, idName: string): void {
        if (!isUUID(id)) {
            throw new Error(`Invalid ${idName}: ${id}`);
        }
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
            .with(lastSnapshotCTE, parsedEventsCTE, eventCountsCTE)
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

    async getLastEventOrderForBoard(boardUuid: string): Promise<number> {
        try {
            const result = await Drizzle.getLastEventOrderForBoard(boardUuid);

            if (typeof result === "undefined") {
                throw new Error(`Failed to get last event order for board ${boardUuid}`);
            }
            return result;
        } catch (error) {
            this.logger.error(`Error getting last event order for board ${boardUuid}: ${error}`);
            throw error;
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

    onEventSave(boardId: string, boardEvent: any): void {}

    // async saveBoardData(transformedData: {
    //     id: string;
    //     name: string;
    //     items: any[];
    //     userId?: string;
    // }): Promise<{ boardId: string; editLink: string }> {
    //     const startTime = Date.now();
    //     this.logger.info("Starting board data save", {
    //         dataId: transformedData.id,
    //         name: transformedData.name,
    //         itemCount: transformedData.items.length,
    //         userId: transformedData.userId,
    //         operation: "saveBoardData",
    //     });

    //     try {
    //         let createdBoard: null | BoardDto = null;

    //         if (transformedData.userId !== undefined) {
    //             createdBoard = (await this.createBoard(
    //                 transformedData.name || "Untitled",
    //                 +transformedData.userId
    //             )) as OwnedBoard;
    //         }

    //         if (createdBoard === null) {
    //             throw new Error("Failed to create board: create_private_board returned null");
    //         }

    //         this.logger.info("Board created, creating edit link", {
    //             boardUuid: createdBoard.uniq_id,
    //             editLink,
    //             operation: "saveBoardData",
    //         });

    //         await this.createLink(createdBoard.uniq_id, "edit", editLink);

    //         this.logger.info("Starting item addition to board", {
    //             boardUuid: createdBoard.uniq_id,
    //             itemCount: transformedData.items.length,
    //             operation: "saveBoardData",
    //         });

    //         for (const item of transformedData.items) {
    //             await this.addEventToBoard(createdBoard.uniq_id, item.eventId, item);
    //         }

    //         const result = {
    //             boardId: createdBoard.uniq_id,
    //             editLink,
    //         };

    //         this.logger.info("Board data saved successfully", {
    //             boardUuid: createdBoard.uniq_id,
    //             executionTime: Date.now() - startTime,
    //             operation: "saveBoardData",
    //         });

    //         return result;
    //     } catch (err) {
    //         this.logger.error("Error saving board data", {
    //             error: err instanceof Error ? err.message : String(err),
    //             stack: err instanceof Error ? err.stack : undefined,
    //             dataId: transformedData.id,
    //             userId: transformedData.userId,
    //             executionTime: Date.now() - startTime,
    //             operation: "saveBoardData",
    //         });
    //         throw err;
    //     }
    // }
}
