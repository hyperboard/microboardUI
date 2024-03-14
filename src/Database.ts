import { Pool } from "pg";
import winston from "winston";
import { sql } from "./sql";

const { DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, DB_HOST } = process.env;

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

export async function getDatabase(logger: winston.Logger): Promise<Pool> {
    const database = new Pool({
        user: DB_USER,
        database: DB_NAME,
        password: DB_PASSWORD,
        port: Number.parseInt(DB_PORT ? DB_PORT : "5432"),
        host: DB_HOST,
    });
    loadFunctions(database, logger);
    return database;
}
