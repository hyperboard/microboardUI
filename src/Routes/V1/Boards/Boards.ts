import { eq } from "drizzle-orm";
import * as Drizzle from "drizzle";
import { AccessToken } from "Interface";
import { boardEventDbWriteLatency } from "Metrics/metrics";
import { v4 as uuidv4 } from "uuid";
import validator from "validator";
import winston from "winston";
import { db, pool } from "../../../drizzle/db";
import { boardEvents, boards } from "../../../drizzle/entities";

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
    private onModeChange?: ((boardUUID: string, mode: "view" | "edit", ignoreUserId: number) => void) | null;
    private onPrivacyChange?: ((boardUUID: string, isPublic: boolean, ignoreUserId: number) => void) | null;
    constructor(private logger: winston.Logger) {}

    setOnModeChange(onModeChange?: (boardUUID: string, mode: "view" | "edit", ignoreUserId: number) => void) {
        this.onModeChange = onModeChange;
    }

    setOnPrivacyChange(onPrivacyChange?: (boardUUID: string, isPublic: boolean, ignoreUserId: number) => void) {
        this.onPrivacyChange = onPrivacyChange;
    }
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

                if (!board?.uniqId) {
                    throw new Error("Error creating board: create_board");
                }

                return {
                    id: board.id,
                    uniq_id: board.uniqId!,
                    boardname: board.title,
                    is_public: true,
                    author_key: board.authorUUID || "", // FIXME: make not null?
                };
            }

            const privateBoard = await Drizzle.createPrivateBoard(title || "Untitled", +ownerId);
            return {
                id: privateBoard.id,
                uniq_id: privateBoard.uniqId!,
                boardname: privateBoard.title,
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

    async setOwner(userId: number, authorKey: string): Promise<void> {
        try {
            this.validateUUID(authorKey, "boardId");

            await Drizzle.addBoardOwner(authorKey, userId);
            this.logger.info(`Succesfully Set owner ${userId}`);
        } catch (error) {
            this.logger.error(`Error setting owner for ${userId}: ${error}`);
            throw error;
        }
    }

    async getOwner(boardUUID: string) {
        try {
            this.validateUUID(boardUUID, "boardUUID");

            const res = await Drizzle.getBoardOwner(boardUUID);
            this.logger.info(`Succesfully get owner ${boardUUID}`);
            return res;
        } catch (error) {
            this.logger.error(`Error getting owner for ${boardUUID}: ${error}`);
            throw error;
        }
    }

    async userVisited(userId: number, linkUUID: string): Promise<void> {
        try {
            this.validateUUID(linkUUID, "linkUUID");
            console.log("visited", linkUUID, userId);
            await Drizzle.addUserVisitedBoard(userId, linkUUID);
            this.logger.info(`Succesfully set visited ${userId} ${linkUUID}`);
        } catch (error) {
            this.logger.error(`Error recording user visit for link ${linkUUID}: ${error}`);
            throw error;
        }
    }

    async getBoards(userId: number) {
        try {
            const author = await this.getAuthoredBoards(userId);
            // const canView = await this.getCanViewBoards(userId);
            const canView = await this.getCanViewBoards(userId);
            const canEdit = await this.getCanEditBoards(userId);
            const shared = await Drizzle.getSharedLinks(userId);

            return { author, canEdit, canView, shared };
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

    async getAuthoredBoards(userId: number) {
        try {
            return await Drizzle.getAuthoredBoards(userId);
        } catch (error) {
            this.logger.error(`Error fetching boards for user ${userId}: ${error}`);
            throw error;
        }
    }

    async getBoard(boardUUID: string) {
        return await db.select().from(boards).where(eq(boards.uniqId, boardUUID));
    }

    async getCanEditBoards(userId: number) {
        try {
            return await Drizzle.getCanEditUserBoards(userId);
        } catch (error) {
            this.logger.error(`Error fetching canEditBoards: ${error}`);
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
                type: board.type,
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
            this.validateUUID(authorKey, "authorKey");

            return await Drizzle.checkBoardAuthor(boardId, authorKey);
        } catch (error) {
            this.logger.error(`Error checking if author key is valid: ${error}`);
            throw error;
        }
    }

    async deleteBoard(boardUUID: string): Promise<void> {
        try {
            await Drizzle.deleteBoard(boardUUID);
            this.logger.info(`Succesfully deleted ${boardUUID}`);
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

    async duplicateBoard(originalBoardUUID: string, appendTitle?: string) {
        try {
            return await Drizzle.duplicateBoard(originalBoardUUID, appendTitle);
        } catch (error) {
            this.logger.error(`Error duplicating board: ${error}`);
            throw error;
        }
    }

    async renameBoard(boardUUID: string, newTitle: string): Promise<void> {
        try {
            await Drizzle.renameBoard(boardUUID, newTitle);
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
            const board = await this.getBoard(boardId);
            if (!board) {
                return;
            }
            await db
                .insert(boardEvents)
                .values(
                    events.map((event) => {
                        const eventId = (event.eventId.split(":")[0] || Date.now().toString()) + ":" + event.order;
                        return {
                            boardId: board[0].id,
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

            await Drizzle.createBoardByLinkType(boardId, type, linkId);
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

    async isValidLink(linkId: string, linkTypes: ("view" | "edit" | "direct")[]): Promise<boolean> {
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
            this.validateUUID(boardId, "");
            return await Drizzle.getBoardIsPublic(boardId);
        } catch (error) {
            this.logger.error(`Error checking valid link: ${error}`);
            return false;
        }
    }

    async getLinkDetails(linkUUID: string) {
        try {
            this.validateUUID(linkUUID, "linkId");

            const link = await Drizzle.getBoardLink(linkUUID);

            if (!link?.boardId) {
                return null;
            }

            const board = await Drizzle.getBoardById(link.boardId);

            return link;
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

    async getPrivateBoards(user: AccessToken) {
        try {
            const privateBoards = await Drizzle.getUserOwnedBoards(+user.sub);
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
            this.validateUUID(boardUuid, "boardUuid");
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
