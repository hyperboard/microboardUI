import winston from "winston";
import { Board } from "./Board";
import { Database } from "Server/Database";

export class Boards {
    constructor(private database: Database, private logger: winston.Logger) { }

    async addBoard(): Promise<Board | undefined> {
        try {
            const result = await this.database.query<{
                id: number;
                uniq_id: string;
            }>("SELECT id, uniq_id from addboard() as (id int, uniq_id uuid)");
            const id = result.rows[0].id;
            const uuid = result.rows[0].uniq_id;
            this.logger.info(
                `added board id=${id}, uuid=${uuid}, row=${JSON.stringify(
                    result.rows[0],
                )}`,
            );
            if (!id) {
                throw new Error("Board id is undefined");
            }
            const board = new Board(id, uuid, this.database, this.logger);
            return board;
        } catch (error) {
            this.logger.error(`adding board, ${JSON.stringify(error)}`);
            return;
        }
    }

    async getBoard(uuid: string): Promise<Board | undefined> {
        try {
            const table = await this.database.query<{
                id: number;
                uniq_id: string;
            }>(
                `
				SELECT id, uniq_id
				FROM boards
				WHERE uniq_id = $1
				`,
                [uuid],
            );
            const row = table.rows[0];
            if (row.uniq_id === uuid) {
                this.logger.info(`got board ${uuid}`);
                return new Board(row.id, uuid, this.database, this.logger);
            } else {
                return;
            }
        } catch (error) {
            this.logger.error(
                `getting board ${uuid}, ${JSON.stringify(error)}`, error
            );
            return;
        }
    }
}
