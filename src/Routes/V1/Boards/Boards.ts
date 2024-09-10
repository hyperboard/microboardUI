import { getBoardIds, getLinks, getSharedLinks } from "Database";
import { AccessToken } from "Interface";
import { Pool } from "pg";
import { v4 as uuidv4 } from "uuid";
import validator from "validator";
import winston from "winston";

function validateUUID(id: string, idName: string): void {
    if (!validator.isUUID(id)) {
        throw new Error(`Invalid ${idName}: ${id}`);
    }
}

export class Boards {
    constructor(private database: Pool, private logger: winston.Logger) {}

    onEventSave(boardId: string, boardEvent: any): void {}

    async saveBoardData(transformedData: {
        id: string;
        name: string;
        items: any[];
        userId?: string;
    }): Promise<{ boardId: string; editLink: string }> {
        try {
            const boardId = uuidv4();
            const editLink = uuidv4();

            await this.createBoard(boardId, transformedData.name, transformedData.userId);
            await this.createLink(boardId, "edit", editLink);

            for (const item of transformedData.items) {
                await this.addEventToBoard(boardId, item.eventId, item);
            }

            this.logger.info(`Board ${boardId} created successfully`);

            return {
                boardId,
                editLink,
            };
        } catch (err) {
            this.logger.error("Error saving board data:", err);
            throw err;
        }
    }

    async createBoard(boardId: string, title: string, ownerId?: string): Promise<any> {
        try {
            validateUUID(boardId, "boardId");
            if (ownerId) {
                const privateBoard = await this.database.query<{
                    board_id: number;
                }>("select * from create_private_board($1, $2, $3)", [boardId, title, ownerId]);
                return privateBoard.rows[0].board_id;
            } else {
                const authorKey = uuidv4();
                const result = await this.database.query("SELECT * FROM create_board($1, $2, $3)", [
                    boardId,
                    title,
                    authorKey,
                ]);
                return { ...result.rows[0].boardId, authorKey };
            }
        } catch (error) {
            this.logger.error(`Error creating board: ${error}`);
            throw error;
        }
    }

    async setOwner(user: AccessToken, authorKey: string): Promise<void> {
        try {
            validateUUID(authorKey, "boardId");
            await this.database.query(`SELECT add_board_owner($1, $2)`, [authorKey, user.sub]);
            this.logger.info(`Succesfully Set owner ${user.sub}`);
        } catch (error) {
            this.logger.error(`Error setting owner for ${user.sub}: ${error}`);
            throw error;
        }
    }

    async userVisited(user: AccessToken, linkId: string): Promise<void> {
        try {
            validateUUID(linkId, "linkId");
            await this.database.query("SELECT user_visited($1, $2)", [user.sub, linkId]);
            this.logger.info(`Succesfully set visited ${user.sub} ${linkId}`);
        } catch (error) {
            this.logger.error(`Error recording user visit for link ${linkId}: ${error}`);
            throw error;
        }
    }

    async getBoards(user: AccessToken) {
        try {
            const ids = await getBoardIds(this.database, user.sub);

            const withLinks = {
                author: (await getLinks(this.database, ids.author, "edit")).map((link, index) => ({
                    boardId: ids.author[index],
                    link: link,
                })),
                canEdit: (await getLinks(this.database, ids.canEdit, "edit")).map((link, index) => ({
                    boardId: ids.canEdit[index],
                    link: link,
                })),
                canView: (await getLinks(this.database, ids.canView, "view")).map((link, index) => ({
                    boardId: ids.canView[index],
                    link: link,
                })),
            };

            const shared = await getSharedLinks(this.database, user.sub);

            return {
                ...withLinks,
                shared,
            };
        } catch (error) {
            this.logger.error(`Error fetching boards for user ${user.sub}: ${error}`);
            throw error;
        }
    }

    async getBoardDetails(boardId: string): Promise<{ boardId: string; created: Date; title: string } | null> {
        try {
            validateUUID(boardId, "boardId");
            const result = await this.database.query(
                `SELECT uniq_id as boardId, created, boardname as title FROM boards WHERE uniq_id = $1 LIMIT 1`,
                [boardId]
            );

            if (result.rows.length > 0) {
                const row = result.rows[0];
                return {
                    boardId: row.boardid,
                    created: row.created,
                    title: row.title,
                };
            } else {
                return null;
            }
        } catch (error) {
            this.logger.error(`Error fetching board details for board ID ${boardId}: ${error}`);
            throw error;
        }
    }

    async isBoardExists(boardId: string): Promise<boolean> {
        try {
            validateUUID(boardId, "boardId");
            const result = await this.database.query("SELECT id FROM boards WHERE uniq_id = $1 LIMIT 1", [boardId]);
            return result.rows.length === 1;
        } catch (error) {
            this.logger.error(`Error checking if board exists: ${error}`);
            throw error;
        }
    }

    async isValidAuthorKey(boardId: string, authorKey: string): Promise<boolean> {
        try {
            validateUUID(boardId, "boardId");
            validateUUID(authorKey, "authorKey");
            const result = await this.database.query(
                "SELECT 1 FROM boards WHERE uniq_id = $1 AND author_key = $2 LIMIT 1",
                [boardId, authorKey]
            );
            return result.rows.length === 1;
        } catch (error) {
            this.logger.error(`Error checking if author key is valid: ${error}`);
            throw error;
        }
    }

    async deleteBoard(boardId: string): Promise<void> {
        try {
            validateUUID(boardId, "boardId");
            await this.database.query("SELECT delete_board($1)", [boardId]);
            this.logger.info(`Succesfully deleted ${boardId}`);
        } catch (error) {
            this.logger.error(`Error deleting board: ${error}`);
            throw error;
        }
    }

    async deleteVisted(user: AccessToken, linkId: string): Promise<void> {
        try {
            validateUUID(linkId, "linkId");
            await this.database.query("SELECT user_unvisited($1, $2)", [user.sub, linkId]);
            this.logger.info(`Successfully removed visited link ${linkId} for user ${user.sub}`);
        } catch (error) {
            this.logger.error(`Error removing visited link ${linkId} for user ${user.sub}: ${error}`);
            throw error;
        }
    }

    async duplicateBoard(originalBoardId: string, newBoardId: string): Promise<any> {
        try {
            validateUUID(originalBoardId, "originalBoardId");
            validateUUID(newBoardId, "newBoardId");
            const result = await this.database.query("SELECT * FROM duplicate_board($1, $2)", [
                originalBoardId,
                newBoardId,
            ]);
            return result.rows[0];
        } catch (error) {
            this.logger.error(`Error duplicating board: ${error}`);
            throw error;
        }
    }

    async renameBoard(boardId: string, newTitle: string): Promise<void> {
        try {
            validateUUID(boardId, "boardId");
            const result = await this.database.query("SELECT rename_board($1, $2)", [boardId, newTitle]);
        } catch (error) {
            this.logger.error(`Error renaming board: ${error}`);
            throw error;
        }
    }

    async addEventToBoard(boardId: string, eventId: string, eventBody: object): Promise<{ order: number; body: any }> {
        try {
            validateUUID(boardId, "boardId");
            const result = await this.database.query<{ order: number }>(
                "select add_event_using_uuid($1, $2, $3) as order",
                [boardId, eventId, eventBody]
            );
            const order = result.rows[0].order;
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

    async getBoardEvents(boardId: string, offset = 0, page?: number, limit?: number): Promise<any[]> {
        try {
            validateUUID(boardId, "boardId");
            /*
            const offset = (page - 1) * limit;
            const result = await this.database.query(
                "SELECT * FROM get_board_events($1, $2, $3)",
                [boardId, limit, offset]
            );
            return result.rows; // Возвращаем массив событий доски.
            */
            const table = await this.database.query(
                "select logid as order, eventbody as body from listevents($1, $2)",
                [boardId, offset]
            );
            return table.rows;
        } catch (error) {
            this.logger.error(`Error retrieving board events: ${error}`);
            throw error;
        }
    }

    async createViewLink(boardId: string): Promise<any> {
        try {
            validateUUID(boardId, "boardId");
            const linkId = uuidv4();
            return this.createLink(boardId, "view", linkId);
        } catch (error) {
            this.logger.error(`Error creating link: ${error}`);
            throw error;
        }
    }

    async getBoardByLink(link: string): Promise<any> {
        try {
            validateUUID(link, "link");

            const queryText = `
                SELECT b.uniq_id as boardId, b.created, b.boardname as title
                FROM boards b
                LEFT JOIN board_edit_link bel ON b.id = bel.board_id
                LEFT JOIN board_view_link bvl ON b.id = bvl.board_id
                WHERE bel.edit_link_uuid = $1 OR bvl.view_link_uuid = $1
                LIMIT 1
            `;

            const result = await this.database.query(queryText, [link]);

            if (result.rows.length === 0) {
                return undefined;
            }

            const row = result.rows[0];
            return {
                boardId: row.boardid,
                created: row.created,
                title: row.title,
            };
        } catch (error) {
            this.logger.error(`Error fetching board by link ${link}: ${error}`);
            throw error;
        }
    }

    async createLink(boardId: string, type: string, linkId: string): Promise<any> {
        try {
            validateUUID(boardId, "boardId");
            validateUUID(linkId, "linkId");
            const table = await this.database.query("select create_link($1, $2, $3)", [boardId, type, linkId]);
            return table;
        } catch (error) {
            this.logger.error(`Error creating link: ${error}`);
            throw error;
        }
    }

    async deleteLink(boardId: string, linkId: string): Promise<any> {
        try {
            validateUUID(boardId, "boardId");
            validateUUID(linkId, "linkId");
            const table = await this.database.query("select delete_link($1, $2)", [boardId, linkId]);
            return table;
        } catch (error) {
            this.logger.error(`Error deleting link: ${error}`);
            throw error;
        }
    }

    async isValidLink(linkId: string, linkTypes: ("view" | "edit")[]): Promise<boolean> {
        try {
            validateUUID(linkId, "linkId");
            const result = await this.database.query("SELECT * FROM get_link($1)", [linkId]);
            if (result.rowCount === 0) {
                return false;
            }
            const link = result.rows[0];
            return linkTypes.includes(link.type);
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
            validateUUID(linkId, "linkId");
            const queryText = `
                SELECT board_id, link_uuid, type 
                FROM get_link($1)
            `;
            const link = await this.database.query<LinkDetail>(queryText, [linkId]);

            if (link.rows.length === 0) {
                return null;
            }

            const board = await this.database.query(`SELECT uniq_id from boards where id = $1`, [
                link.rows[0].board_id,
            ]);

            if (board.rows.length === 0) {
                throw new Error("Board Not Found");
            }

            const { link_uuid, type } = link.rows[0];

            return {
                linkId,
                type,
                boardId: board.rows[0].uniq_id,
            };
        } catch (error) {
            this.logger.error(`Error getting link details: ${error}`);
            return null;
        }
    }

    async getPrivateBoards(user: AccessToken): Promise<Array<{ get_private_boards: string }> | undefined> {
        try {
            const privateBoards = await this.database.query<{
                get_private_boards: string;
            }>("select * from get_private_boards($1) as board", [user.sub]);
            return privateBoards.rows;
        } catch (e) {
            this.logger.error("Get private boards error");
            return undefined;
        }
    }

    async saveBoardSnapshot(boardUuidOrEditLink: string, snapshot: any) {
        try {
            validateUUID(boardUuidOrEditLink, "boardUuidOrEditLink");
            await this.database.query("SELECT save_board_snapshot($1, $2, $3)", [
                boardUuidOrEditLink,
                snapshot,
                snapshot.lastIndex,
            ]);
        } catch (error) {
            this.logger.error(`Error saving snapshot for board ${boardUuidOrEditLink}: ${error}`);
            throw error;
        }
    }

    async getLatestBoardSnapshot(boardUuidOrEditLink: string): Promise<any> {
        try {
            validateUUID(boardUuidOrEditLink, "boardUuidOrEditLink");
            const result = await this.database.query<{ snapshot: any }>(
                "SELECT get_latest_board_snapshot($1) AS snapshot",
                [boardUuidOrEditLink]
            );

            if (result.rows.length === 0) {
                throw new Error(`No snapshot found for board or link UUID ${boardUuidOrEditLink}`);
            }

            return result.rows[0].snapshot;
        } catch (error) {
            this.logger.error(`Error retrieving latest snapshot for board ${boardUuidOrEditLink}: ${error}`);
            throw error;
        }
    }

    async getEventCountSinceLastSnapshot(boardId: string): Promise<number> {
        try {
            validateUUID(boardId, "boardId");
            const result = await this.database.query<{ count: number }>(
                "SELECT get_event_count_since_last_snapshot($1) AS count",
                [boardId]
            );
            return result.rows[0].count;
        } catch (error) {
            this.logger.error(`Error getting event count since last snapshot for board ${boardId}: ${error}`);
            throw error;
        }
    }
}

interface LinkDetail {
    board_id: number;
    link_uuid: string;
    type: "edit" | "view";
}
