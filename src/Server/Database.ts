import {Pool, QueryResult, QueryResultRow} from "pg";
import winston from "winston";
import {sql} from "./sql";

const {DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, DB_HOST} = process.env;

export class Database {
    private pool = new Pool({
        user: DB_USER,
        database: DB_NAME,
        password: DB_PASSWORD,
        port: Number.parseInt(DB_PORT ? DB_PORT : "5432"),
        host: DB_HOST,
    });

    async query<Type extends QueryResultRow>(
        query: string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        values: any[] = [],
    ): Promise<QueryResult<Type>> {
        return this.pool.query(query, values);
    }
}

function loadFunctions(database: Database, logger: winston.Logger): void {
    async function loadFunction(name: string, body: string): Promise<void> {
        try {
            await database.query(body);
            logger.info("Loaded PGSQL function: " + name);
        } catch (error) {
            const retry = 1000;
            logger.error(
                `Error when loading PGSQL function: ${name}
				${body}
				`,
                error,
                `Will retry in ${retry}ms`,
            );
            // If it fails to load the function (probably because the database is not ready yet) retry in 1 second
            await new Promise<boolean>(resolve =>
                setTimeout(() => {
                    loadFunction(name, body);
                    resolve(true);
                }, 1000),
            );
        }
    }

    loadFunction("pgsql", sql);
}

export async function getDatabase(logger: winston.Logger): Promise<Database> {
    const database = new Database();
    loadFunctions(database, logger);
    return database;
}
