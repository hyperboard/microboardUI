import { AccessToken } from "Interface";
import { Pool } from "pg";
import winston from "winston";

export class Boards {
    constructor(private database: Pool, private logger: winston.Logger) {}

    onEventSave(boardId: string, boardEvent: any): void {}

    async createBoard(
        boardId: string,
        title: string,
        ownerId?: string
    ): Promise<any> {
        try {
            const truncatedTitle = title.slice(0, 32);

            if (ownerId) {
                const privateBoard = await this.database.query<{
                    board_id: number;
                }>("select * from create_private_board($1, $2, $3)", [
                    boardId,
                    truncatedTitle,
                    ownerId,
                ]);
                return privateBoard.rows[0].board_id;
            } else {
                const result = await this.database.query(
                    "SELECT * FROM create_board($1, $2)",
                    [boardId, truncatedTitle]
                );
                return result.rows[0].boardId;
            }
        } catch (error) {
            this.logger.error(`Error creating board: ${error}`);
            throw error;
        }
    }

    async isBoardExists(boardId: string): Promise<boolean> {
        try {
            const result = await this.database.query(
                "SELECT id FROM boards WHERE uniq_id = $1 LIMIT 1",
                [boardId]
            );
            return result.rows.length === 1;
        } catch (error) {
            this.logger.error(`Error checking if board exists: ${error}`);
            throw error;
        }
    }

    async deleteBoard(boardId: string): Promise<void> {
        try {
            await this.database.query("SELECT delete_board($1)", [boardId]);
        } catch (error) {
            this.logger.error(`Error deleting board: ${error}`);
            throw error;
        }
    }

    async duplicateBoard(
        originalBoardId: string,
        newBoardId: string
    ): Promise<any> {
        try {
            const result = await this.database.query(
                "SELECT * FROM duplicate_board($1, $2)",
                [originalBoardId, newBoardId]
            );
            return result.rows[0];
        } catch (error) {
            this.logger.error(`Error duplicating board: ${error}`);
            throw error;
        }
    }

    async renameBoard(boardId: string, newTitle: string): Promise<void> {
        try {
            const result = await this.database.query(
                "SELECT rename_board($1, $2)",
                [boardId, newTitle]
            );
        } catch (error) {
            this.logger.error(`Error renaming board: ${error}`);
            throw error;
        }
    }

    async addEventToBoard(
        boardId: string,
        eventId: string,
        eventBody: object
    ): Promise<{ order: number; body: any }> {
        try {
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

    async getBoardEvents(
        boardId: string,
        offset = 0,
        page?: number,
        limit?: number
    ): Promise<any[]> {
        try {
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

    async createLink(
        boardId: string,
        type: string,
        linkId: string
    ): Promise<any> {
        try {
            const table = await this.database.query(
                "select create_link($1, $2, $3)",
                [boardId, type, linkId]
            );
            return table;
        } catch (error) {
            this.logger.error(`Error creating link: ${error}`);
            throw error;
        }
    }

    async deleteLink(boardId: string, linkId: string): Promise<any> {
        try {
            const table = await this.database.query(
                "select delete_link($1, $2)",
                [boardId, linkId]
            );
            return table;
        } catch (error) {
            this.logger.error(`Error deleting link: ${error}`);
            throw error;
        }
    }

    async isValidLink(
        linkId: string,
        linkTypes: ("view" | "edit")[]
    ): Promise<boolean> {
        try {
            const result = await this.database.query(
                "SELECT * FROM get_link($1)",
                [linkId]
            );
            if (result.rowCount === 0) {
                return false;
            }
            const link = result.rows[0];
            return linkTypes.includes(link.type);
        } catch (error) {
            this.logger.error(`Error checking valid link: ${error}`);
            throw error;
        }
    }

    async getPrivateBoards(
        user: AccessToken
    ): Promise<Array<{ get_private_boards: string }> | undefined> {
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

    async saveBoardSnapshot(
        boardId: string,
        snapshot: any,
        lastEventOrder: number
    ) {
        try {
            await this.database.query(
                "INSERT INTO snapshots (board_id, snapshot, last_event_order) VALUES ($1, $2, $3)",
                [boardId, snapshot, lastEventOrder]
            );
        } catch (error) {
            this.logger.error(
                `Error saving snapshot for board ${boardId}: ${error}`
            );
            throw error;
        }
    }

    async getLatestBoardSnapshot(): Promise<any> {}

    async getEventCountSinceLastSnapshot(boardId: string): Promise<number> {
        return 0;
        try {
            const result = await this.database.query(
                "SELECT count(*) FROM events WHERE board_id = $1 AND order > (SELECT last_event_order FROM snapshots WHERE board_id = $1 ORDER BY created_at DESC LIMIT 1)",
                [boardId]
            );
            return parseInt(result.rows[0].count, 10);
        } catch (error) {
            this.logger.error(
                `Error getting event count since last snapshot for board ${boardId}: ${error}`
            );
            throw error;
        }
    }
}
