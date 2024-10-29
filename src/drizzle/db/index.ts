import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

export const pool = new Pool({
    host: DB_HOST || "postgres_test",
    port: parseInt(DB_PORT || "5435"),
    user: DB_USER || "postgres",
    password: DB_PASSWORD || "12345",
    database: DB_NAME || "postgres",
});

export const db = drizzle(pool);
