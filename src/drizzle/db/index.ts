import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import dotenv from 'dotenv';

dotenv.config();

console.log('dbIndex', process.env);

export const pool = new Pool({
    host: process.env.DB_HOST || "postgres_test",
    port: parseInt(process.env.DB_PORT || "5435"),
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "12345",
    database: process.env.DB_NAME || "postgres",
});

export const db = drizzle(pool);
