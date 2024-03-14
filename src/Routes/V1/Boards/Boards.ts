import { Pool } from "pg";
import winston from "winston";

export class Boards {
    constructor(private database: Pool, private logger: winston.Logger) {}

    onEventSave(boardId: string, boardEvent: any): void {}

    async createBoard(boardId: string, title: string): Promise<any> {
        try {
            const result = await this.database.query(
                "SELECT * FROM create_board($1, $2)",
                [boardId, title]
            );
            return;
            // return result.rows[0].boardId;
        } catch (error) {
            this.logger.error(`Error creating board: ${error}`);
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
                "SELECT * FROM duplicate_board($1)",
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
            const boardEvent = { order, body: eventBody };
            this.onEventSave(boardId, {
                type: "BoardEvent",
                boardId,
                boardEvent,
            });
            return boardEvent;
        } catch (error) {
            this.logger.error(`Error adding event to board: ${error}`);
            throw error;
        }
    }

    async getBoardEvents(
        boardId: string,
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
                [boardId, 0]
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
                "select deleta_link($1, $2)",
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
        linkTypes: ("read" | "edit")[]
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
}
