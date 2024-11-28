import * as Drizzle from "drizzle";
import { AccessToken } from "Interface";
import { db, pool } from "../../../drizzle/db";
import { boardEditLink, boardEvents, boards, boardViewLink } from "../../../drizzle/entities";
import { eq, or, sql } from "drizzle-orm";
import { boardEventDbWriteLatency, snapshotReadLatency, snapshotSaveLatency } from "Metrics/metrics";
import { v4 as uuidv4 } from "uuid";
import validator from "validator";
import winston from "winston";

function validateUUID(id: string, idName: string): void {
    if (!validator.isUUID(id)) {
        throw new Error(`Invalid ${idName}: ${id}`);
    }
}

export interface BoardEventData {
    eventId: string;
    body: object;
    order: number;
    operation: any;
}

type Board = {
    id: number;
    uniq_id: string;
    boardname: string | null;
    is_public: boolean;
};

export type AnonymousBoard = Board & {
    author_key: string;
};

export type OwnedBoard = Board & {
    owner_id: number;
};

export class Boards {
    constructor(private logger: winston.Logger) {}

    onEventSave(boardId: string, boardEvent: any): void {}

    async saveBoardData(transformedData: {
        id: string;
        name: string;
        items: any[];
        userId?: string;
    }): Promise<{ boardId: string; editLink: string }> {
        const startTime = Date.now();
        this.logger.info("Starting board data save", {
            dataId: transformedData.id,
            name: transformedData.name,
            itemCount: transformedData.items.length,
            userId: transformedData.userId,
            operation: "saveBoardData",
        });

        try {
            const editLink = uuidv4();
            let createdBoard: null | OwnedBoard = null;

            if (transformedData.userId !== undefined) {
                createdBoard = (await this.createBoard(
                    transformedData.name || "Untitled",
                    +transformedData.userId
                )) as OwnedBoard;
            }

            if (createdBoard === null) {
                throw new Error("Failed to create board: create_private_board returned null");
            }

            this.logger.info("Board created, creating edit link", {
                boardUuid: createdBoard.uniq_id,
                editLink,
                operation: "saveBoardData",
            });

            await this.createLink(createdBoard.uniq_id, "edit", editLink);

            this.logger.info("Starting item addition to board", {
                boardUuid: createdBoard.uniq_id,
                itemCount: transformedData.items.length,
                operation: "saveBoardData",
            });

            for (const item of transformedData.items) {
                await this.addEventToBoard(createdBoard.uniq_id, item.eventId, item);
            }

            const result = {
                boardId: createdBoard.uniq_id,
                editLink,
            };

            this.logger.info("Board data saved successfully", {
                boardUuid: createdBoard.uniq_id,
                executionTime: Date.now() - startTime,
                operation: "saveBoardData",
            });

            return result;
        } catch (err) {
            this.logger.error("Error saving board data", {
                error: err instanceof Error ? err.message : String(err),
                stack: err instanceof Error ? err.stack : undefined,
                dataId: transformedData.id,
                userId: transformedData.userId,
                executionTime: Date.now() - startTime,
                operation: "saveBoardData",
            });
            throw err;
        }
    }

    async createBoard(
        title?: string,
        ownerId: number | undefined = undefined,
        isPublic = false
    ): Promise<AnonymousBoard | OwnedBoard> {
        const startTime = Date.now();
        this.logger.info("Starting board creation", {
            title,
            ownerId,
            isPublic,
            operation: "createBoard",
        });

        try {
            if (!ownerId) {
                const authorKey = uuidv4();
                const board = await Drizzle.createBoard(title || "Untitled", authorKey);

                if (!board?.boardUUID) {
                    throw new Error("Error creating board: create_board");
                }

                return {
                    id: board.id,
                    uniq_id: board.boardUUID!,
                    boardname: board.boardName,
                    is_public: true,
                    author_key: board.authorUUID || "", // FIXME: make not null?
                };
            }

            const privateBoard = await Drizzle.createPrivateBoard(title || "Untitled", +ownerId);
            return {
                id: privateBoard.id,
                uniq_id: privateBoard.boardUUID!,
                boardname: privateBoard.boardName,
                is_public: false,
                owner_id: ownerId,
            };
        } catch (error) {
            this.logger.error("Error creating board", {
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
                title,
                ownerId,
                isPublic,
                executionTime: Date.now() - startTime,
                operation: "createBoard",
            });
            throw error;
        }
    }

    async setOwner(user: AccessToken, authorKey: string): Promise<void> {
        try {
            this.validateUUID(authorKey, "boardId");

            await Drizzle.addBoardOwner(authorKey, +user.sub);
            this.logger.info(`Succesfully Set owner ${user.sub}`);
        } catch (error) {
            this.logger.error(`Error setting owner for ${user.sub}: ${error}`);
            throw error;
        }
    }

    async userVisited(user: AccessToken, linkId: string): Promise<void> {
        try {
            this.validateUUID(linkId, "linkId");

            await Drizzle.userVisited(+user.sub, linkId);
            this.logger.info(`Succesfully set visited ${user.sub} ${linkId}`);
        } catch (error) {
            this.logger.error(`Error recording user visit for link ${linkId}: ${error}`);
            throw error;
        }
    }

    async getBoards(userId: number) {
        try {
            const author = await this.getAuthoredBoards(userId);
            const canView = await this.getCanViewBoards(userId);
            const canEdit = await this.getCanEditBoards(userId);
            const shared = await Drizzle.getSharedLinks(userId);

            return { author, canEdit, canView, shared };
        } catch (error) {
            this.logger.error(`Error fetching boards for user ${userId}: ${error}`);
            throw error;
        }
    }

    async getAuthoredBoards(userId: number) {
        try {
            return await Drizzle.getAuthoredBoards(userId);
        } catch (error) {
            this.logger.error(`Error fetching boards for user ${userId}: ${error}`);
            throw error;
        }
    }

    async getCanViewBoards(userId: number) {
        try {
            return await Drizzle.getBoardsUserCanView(userId);
        } catch (error) {
            this.logger.error(`Error fetching boards for user ${userId}: ${error}`);
            throw error;
        }
    }

    async getCanEditBoards(userId: number) {
        try {
            return await Drizzle.getCanEditUserBoards(userId);
        } catch (error) {
            this.logger.error(`Error fetching boards for user ${userId}: ${error}`);
            throw error;
        }
    }

    async getBoardIds(userId: number) {
        try {
            return await Drizzle.getUserBoardIds(userId);
        } catch (error) {
            this.logger.error(`Error fetching boards for user ${userId}: ${error}`);
            throw error;
        }
    }

    async getBoardDetails(boardId: string) {
        try {
            this.validateUUID(boardId, "boardId");

            const board = await Drizzle.getBoardByLink(boardId);

            if (!board) {
                return null;
            }

            return {
                boardId: board.boardUUID,
                created: board.created,
                title: board.title,
                is_public: board.isPublic,
            };
        } catch (error) {
            this.logger.error(`Error fetching board details for board ID ${boardId}: ${error}`);
            throw error;
        }
    }

    async isBoardExists(boardId: string): Promise<boolean> {
        try {
            this.validateUUID(boardId, "boardId");

            const id = await Drizzle.getBoardId(boardId);
            return id ? true : false;
        } catch (error) {
            this.logger.error(`Error checking if board exists: ${error}`);
            throw error;
        }
    }

    async isValidAuthorKey(boardId: string, authorKey: string): Promise<boolean> {
        try {
            this.validateUUID(boardId, "boardId");
            this.validateUUID(authorKey, "authorKey");

            return await Drizzle.checkBoardAuthor(boardId, authorKey);
        } catch (error) {
            this.logger.error(`Error checking if author key is valid: ${error}`);
            throw error;
        }
    }

    async deleteBoard(boardId: string): Promise<void> {
        try {
            this.validateUUID(boardId, "boardId");

            await Drizzle.deleteBoard(boardId);
            this.logger.info(`Succesfully deleted ${boardId}`);
        } catch (error) {
            this.logger.error(`Error deleting board: ${error}`);
            throw error;
        }
    }

    async deleteVisted(user: AccessToken, linkId: string): Promise<any | null> {
        try {
            this.validateUUID(linkId, "linkId");

            const result = await Drizzle.userUnvisited(+user.sub, linkId);

            this.logger.info(`Successfully removed visited link ${linkId} for user ${user.sub}`);

            return result;
        } catch (error) {
            this.logger.error(`Error removing visited link ${linkId} for user ${user.sub}: ${error}`);
            throw error;
        }
    }

    async duplicateBoard(originalBoardId: string, newBoardId: string): Promise<any> {
        try {
            this.validateUUID(originalBoardId, "originalBoardId");
            this.validateUUID(newBoardId, "newBoardId");

            return await Drizzle.duplicateBoard(originalBoardId, newBoardId);
        } catch (error) {
            this.logger.error(`Error duplicating board: ${error}`);
            throw error;
        }
    }

    async renameBoard(boardId: string, newTitle: string): Promise<void> {
        try {
            this.validateUUID(boardId, "boardId");

            await Drizzle.renameBoard(boardId, newTitle);
        } catch (error) {
            this.logger.error(`Error renaming board: ${error}`);
            throw error;
        }
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
            let board: any = await db
                .select({ id: boards.id })
                .from(boards)
                .where(eq(boards.boardUUID, boardId))
                .limit(1)
                .then((res) => res[0]);

            if (!board) {
                const editLink = await db
                    .select({ boardId: boardEditLink.boardId })
                    .from(boardEditLink)
                    .where(eq(boardEditLink.editLinkUUID, boardId))
                    .limit(1)
                    .then((res) => res[0]);

                if (!editLink) {
                    throw new Error(`Board with UUID ${boardId} does not exist`);
                }

                board = { id: editLink.boardId };
            }

            await db.insert(boardEvents).values(
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
            ).onConflictDoNothing();

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
            this.validateUUID(boardId, "boardId");

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

    async createLink(boardId: string, type: string, linkId: string): Promise<any> {
        const startTime = Date.now();
        this.logger.info("Starting link creation", {
            boardId,
            type,
            linkId,
            operation: "createLink",
        });

        try {
            this.validateUUID(boardId, "boardId");
            this.validateUUID(linkId, "linkId");

            await Drizzle.createBoardLinkByType(boardId, type, linkId);
        } catch (error) {
            this.logger.error("Error creating link", {
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
                boardId,
                type,
                linkId,
                executionTime: Date.now() - startTime,
                operation: "createLink",
            });
            throw error;
        }
    }

    async deleteLink(boardId: string, linkId: string): Promise<any> {
        try {
            this.validateUUID(boardId, "boardId");
            this.validateUUID(linkId, "linkId");

            await Drizzle.deleteBoardLink(boardId, linkId);
        } catch (error) {
            this.logger.error(`Error deleting link: ${error}`);
            throw error;
        }
    }

    async isValidLink(linkId: string, linkTypes: ("view" | "edit")[]): Promise<boolean> {
        try {
            this.validateUUID(linkId, "linkId");

            const link = await Drizzle.getBoardLink(linkId);

            if (!link) {
                return false;
            }

            return linkTypes.includes(link.linkType);
        } catch (error) {
            this.logger.error(`Error checking valid link: ${error}`);
            return false;
        }
    }

    async isBoardPublic(boardId: string): Promise<boolean> {
        try {
            validateUUID(boardId, "");
            return await Drizzle.getBoardIsPublic(boardId);
        } catch (error) {
            this.logger.error(`Error checking valid link: ${error}`);
            return false;
        }
    }

    async getLinkDetails(linkId: string): Promise<{
        linkId: string;
        boardId: string;
        type: "edit" | "view";
    } | null> {
        try {
            this.validateUUID(linkId, "linkId");

            const link = await Drizzle.getBoardLink(linkId);

            if (!link?.boardId) {
                return null;
            }

            const board = await Drizzle.getBoardById(link.boardId);

            return {
                linkId: link.linkUUID,
                type: link.linkType,
                boardId: board.boardUUID!,
            };
        } catch (error) {
            this.logger.error(`Error getting link details: ${error}`);
            return null;
        }
    }

    async getBoardByLink(link: string) {
        try {
            this.validateUUID(link, "link");

            const result = await Drizzle.getBoardByLink(link);

            return result;
        } catch (error) {
            this.logger.error(`Error fetching board by link ${link}: ${error}`);
            throw error;
        }
    }

    async getPrivateBoards(user: AccessToken): Promise<Array<{ get_private_boards: string | null }> | undefined> {
        try {
            const privateBoards = await Drizzle.getPrivateBoards(+user.sub);
            return privateBoards;
        } catch (e) {
            this.logger.error("Get private boards error");
            return undefined;
        }
    }

    async saveBoardSnapshot(boardUuidOrEditLink: string, snapshot: any) {
        try {
            this.validateUUID(boardUuidOrEditLink, "boardUuidOrEditLink");

            await Drizzle.saveBoardSnapshot(boardUuidOrEditLink, snapshot, snapshot.lastIndex);
        } catch (error) {
            this.logger.error(`Error saving snapshot for board ${boardUuidOrEditLink}: ${error}`);
            throw error;
        }
    }

    async getLatestBoardSnapshot(boardUuidOrEditLink: string): Promise<any> {
        try {
            this.validateUUID(boardUuidOrEditLink, "boardUuidOrEditLink");
            // FIXME: proper type
            const result: any[] = (await Drizzle.getLatestBoardSnapshot(boardUuidOrEditLink)) as any[];

            if (result?.length === 0) {
                // throw new Error(`No snapshot found for board or link UUID ${boardUuidOrEditLink}`);
                return null;
            }

            return result;
        } catch (error) {
            this.logger.error(`Error retrieving latest snapshot for board ${boardUuidOrEditLink}: ${error}`);
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
        if (!validator.isUUID(id)) {
            throw new Error(`Invalid ${idName}: ${id}`);
        }
    }

    async getAllBoardLastEventOrders(batchSize: number = 10): Promise<Array<{
        board_uuid: string;
        edit_link_uuids: string[];
        last_order: number;
    }> | null> {
        try {
            const query = `
                    WITH extracted_values AS (
                        SELECT be.board_id, 
                            be.event_id, 
                            CAST((regexp_matches(be.event_id, '(\\d+):(\\d+)'))[2] AS INTEGER) AS integer2_value
                        FROM board_events be
                    ),
                    last_order_per_board AS (
                        SELECT board_id, 
                            MAX(integer2_value) AS last_order
                        FROM extracted_values
                        GROUP BY board_id
                    )
                    SELECT b.uniq_id AS board_uuid, 
                        lo.last_order
                    FROM boards b
                    JOIN last_order_per_board lo ON b.id = lo.board_id
                    GROUP BY b.uniq_id, lo.last_order
                `;

            const results = await pool.query(query);

            return results.rows as Array<{
                board_uuid: string;
                edit_link_uuids: string[];
                last_order: number;
            }>;
        } catch (error) {
            console.error(`Error processing boards last_orders: ${error}`);
            return null;
        }
    }

    async getLastEventOrderForBoard(boardUuid: string): Promise<number> {
        try {
            validateUUID(boardUuid, "boardUuid");
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
}

interface LinkDetail {
    board_id: number;
    link_uuid: string;
    type: "edit" | "view";
}
