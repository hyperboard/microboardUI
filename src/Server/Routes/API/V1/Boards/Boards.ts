import winston from "winston";
import { Board } from "./Board";
import { Database } from "Server/Database";

type AddBoardParams = {
    ownerId?: string;
}


export class Boards {
    constructor(private database: Database, private logger: winston.Logger) { }

    async addBoard(params: AddBoardParams): Promise<Board | undefined> {
        try {
            if (params.ownerId) {
                const privateBoard = await this.database.query<{board_id: number}>(
                    "select * from create_private_board($1, $2)",
                    ["Board name", params.ownerId],
                );

                const createdBoard = await this.database.query<any>(
                    "select id, uniq_id from boards where id = $1",
                    [privateBoard.rows[0].board_id],
                );
                
                const uuid = createdBoard.rows[0].uniq_id;

                await this.database.query(
                    "select addboardtable($1)",
                    [privateBoard.rows[0].board_id]
                );

                const board = new Board(privateBoard.rows[0].board_id, uuid, this.database, this.logger);
                return board;
            } else {
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
            }

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

    async getPrivateBoards(user: RequestUser): Promise<Array<{get_private_boards: string}> | undefined> {
        try {
            console.log('try to get private boards');
            const privateBoards = await this.database.query<{get_private_boards: string}>(
                "select * from get_private_boards($1) as board",
                [user.id]
            );
            console.log('private boards: ', privateBoards.rows)
            return privateBoards.rows;
        } catch(e) {
            console.log('Error when trying to get private boards');
            this.logger.error("Get private boards error");
            return undefined;
        }
    }
}
