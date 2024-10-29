import { Pool } from "pg";
import winston from "winston";
import { sql } from "./sql";
import { AccessToken } from "Interface";

function loadFunctions(database: Pool, logger: winston.Logger): void {
    async function loadFunction(name: string, body: string): Promise<void> {
        try {
            await database.query(body);
            logger.info("Loaded PGSQL function: " + name);
        } catch (error) {
            const retry = 1000;
            logger.error(
                `Error when loading PGSQL function: ${name}`,
                // ` ${body}`,
                error,
                `Will retry in ${retry}ms`
            );
            // If it fails to load the function (probably because the database is not ready yet) retry in 1 second
            await new Promise<boolean>((resolve) =>
                setTimeout(() => {
                    loadFunction(name, body);
                    resolve(true);
                }, retry)
            );
        }
    }

    loadFunction("pgsql", sql);
}

let database: Pool | null = null; // TODO: rewrite
export async function getDatabase(logger: winston.Logger): Promise<Pool> {
    const { DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, DB_HOST } = process.env;
    if (database === null) {
        database = new Pool({
            user: DB_USER,
            database: DB_NAME,
            password: DB_PASSWORD,
            port: Number.parseInt(DB_PORT ? DB_PORT : "5432"),
            host: DB_HOST,
        });
        loadFunctions(database, logger);
    }
    return database;
}

export async function getBoardIds(database: Pool, userId: string) {
    const result = await database.query<{
        authored_boards: string;
        can_edit_boards: string;
        can_view_boards: string;
    }>("SELECT * FROM get_user_board_ids($1)", [userId]);

    return {
        author: result.rows.map((row) => row.authored_boards).filter((id) => id),
        canEdit: result.rows.map((row) => row.can_edit_boards).filter((id) => id),
        canView: result.rows.map((row) => row.can_view_boards).filter((id) => id),
    };
}

export async function getLinks(database: Pool, boardIds: string[], type: "edit" | "view") {
    const query =
        type === "edit" ? "SELECT * FROM get_board_edit_link($1::uuid)" : "SELECT * FROM get_board_view_link($1::uuid)";
    const links = await Promise.all(
        boardIds.map(async (boardId) => {
            const result = await database.query<{
                get_board_edit_link?: string;
                get_board_view_link?: string;
            }>(query, [boardId]);
            return (result.rows[0].get_board_edit_link ?? result.rows[0].get_board_view_link) || "";
        })
    );
    return links.filter((link) => !!link);
}

/** @returns array of edit/view links user visited but not authored */
export async function getSharedLinks(database: Pool, userId: number) {
    const sharedEditLinksQuery = await database.query<{
        id: string;
        boardname: string;
        is_public: boolean;
    }>(
        `
                SELECT uel.edit_link_uuid as id, b.boardname, b.is_public
                FROM user_edit_link uel 
                JOIN board_edit_link bel ON bel.edit_link_uuid = uel.edit_link_uuid
                JOIN boards b ON bel.board_id = b.id
                WHERE uel.user_id = $1
            `,
        [userId]
    );
    const sharedViewLinksQuery = await database.query<{
        id: string;
        boardname: string;
        is_public: boolean;
    }>(
        `
                SELECT uvl.view_link_uuid as id, b.boardname, b.is_public
                FROM user_view_link uvl 
                JOIN board_view_link bvl ON bvl.view_link_uuid = uvl.view_link_uuid
                JOIN boards b ON bvl.board_id = b.id
                WHERE uvl.user_id = $1
            `,
        [userId]
    );
    const sharedBoardIdsQuery = await database.query<{
        id: string;
        boardname: string;
        is_public: boolean;
    }>(
        `
                SELECT ubi.board_uuid as id, b.boardname, b.is_public
                FROM user_board_id ubi 
                JOIN boards b ON ubi.board_uuid = b.uniq_id
                WHERE ubi.user_id = $1
            `,
        [userId]
    );
    return [...sharedEditLinksQuery.rows, ...sharedViewLinksQuery.rows, ...sharedBoardIdsQuery.rows];
}
