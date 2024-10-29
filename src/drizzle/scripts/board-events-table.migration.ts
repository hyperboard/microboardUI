import { count, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool, PoolClient } from "pg";
import { boardEvents, boards } from "../entities";

const { DB_USER, DB_PASSWORD, DB_NAME, DB_PORT, DB_HOST } = process.env;

async function verifyBoardMigration(client: PoolClient, boardTable: string) {
    const boardId = parseInt(boardTable.replace("board", ""));

    const verificationQuery = await client.query(
        `
        WITH source_count AS (
            SELECT COUNT(*) as count 
            FROM ${boardTable}
        ),
        actual_count AS (
            SELECT COUNT(*) as count
            FROM board_events
            WHERE board_id = $1
        )
        SELECT 
            source_count.count as expected_count,
            actual_count.count as actual_count
        FROM source_count, actual_count;
    `,
        [boardId]
    );

    const { expected_count, actual_count } = verificationQuery.rows[0];

    if (expected_count !== actual_count) {
        console.log(`Verification failed for ${boardTable}: Expected ${expected_count}, Got ${actual_count}`);
        return false;
    }

    return true;
}

async function createBoardEventsTable(pool: Pool) {
    try {
        // Create table if it doesn't exist (removed DROP TABLE)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS board_events (
              board_id INTEGER NOT NULL,
              log_id BIGSERIAL PRIMARY KEY,
              event_id VARCHAR(32),
              event_body JSONB,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              CONSTRAINT fk_board
                FOREIGN KEY(board_id) 
                REFERENCES boards(id)
                ON DELETE CASCADE
            )
        `);

        const tableCheck = await pool.query(`
            SELECT to_regclass('public.board_events') IS NOT NULL as exists;
        `);

        if (!tableCheck.rows[0].exists) {
            throw new Error("Failed to create board_events table");
        }

        console.log("board_events table created or already exists");
    } catch (error) {
        console.error("Error creating board_events table:", error);
        throw error;
    }
}

async function migrateSingleBoard(client: PoolClient, db: any, tableName: string) {
    const boardId = parseInt(tableName.replace("board", ""));

    try {
        await client.query("BEGIN");

        const [board] = await db.select().from(boards).where(eq(boards.id, boardId)).limit(1).execute();

        if (!board) {
            console.log(`Skipping ${tableName}: Not present in boards table`);
            await client.query("ROLLBACK");
            return { status: "skipped", reason: "Not present in boards table" };
        }

        const countResult = await client.query(`SELECT COUNT(*) FROM ${tableName}`);
        const totalEvents = parseInt(countResult.rows[0].count);

        if (totalEvents === 0) {
            console.log(`Skipping ${tableName}: No events to migrate`);
            await client.query("ROLLBACK");
            return { status: "skipped", reason: "No events to migrate" };
        }

        // Process in chunks
        const CHUNK_SIZE = 1000;
        for (let offset = 0; offset < totalEvents; offset += CHUNK_SIZE) {
            const events = await client.query(`SELECT * FROM ${tableName} ORDER BY logid ASC LIMIT $1 OFFSET $2`, [
                CHUNK_SIZE,
                offset,
            ]);

            await db.insert(boardEvents).values(
                events.rows.map((event) => ({
                    boardId,
                    eventId: event.eventid,
                    eventBody: event.eventbody,
                }))
            );

            console.log(
                `\t${tableName}: Processed ${Math.min(offset + CHUNK_SIZE, totalEvents)}/${totalEvents} events`
            );
        }

        // Verify migration for this board
        const isVerified = await verifyBoardMigration(client, tableName);
        if (!isVerified) {
            throw new Error("Verification failed");
        }

        await client.query("COMMIT");
        return { status: "success" };
    } catch (error) {
        await client.query("ROLLBACK");
        console.error(`Error processing ${tableName}:`, error);
        return {
            status: "failed",
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

async function migrateData() {
    const pool = new Pool({
        user: DB_USER || "postgres",
        database: DB_NAME || "postgres",
        password: DB_PASSWORD || "12345",
        port: parseInt(DB_PORT || "5435"),
        host: DB_HOST || "localhost",
    });

    const db = drizzle(pool);
    const client = await pool.connect();

    try {
        await createBoardEventsTable(pool);

        const tablesResult = await client.query(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name ~ '^board[0-9]+$'
            ORDER BY table_name;
        `);

        const boardTables = tablesResult.rows.map((row) => row.table_name);

        if (boardTables.length === 0) {
            console.log("No board tables found to migrate");
            return;
        }

        const importedTablesQuery = await client.query(`
            SELECT DISTINCT board_id FROM board_events;
        `);
        const importedTables = new Set(importedTablesQuery.rows.map((row) => row.board_id));

        const migrationResults = {
            successful: [] as string[],
            skipped: [] as { table: string; reason: string }[],
            failed: [] as { table: string; error: string }[],
        };

        for (const tableName of boardTables) {
            console.log(`\nStarting migration for ${tableName}`);
            const boardId = parseInt(tableName.replace("board", ""));

            if (importedTables.has(boardId)) {
                migrationResults.skipped.push({ table: tableName, reason: "Already imported" });
                continue;
            }

            const result = await migrateSingleBoard(client, db, tableName);

            if (result.status === "success") {
                migrationResults.successful.push(tableName);
            } else if (result.status === "skipped") {
                migrationResults.skipped.push({ table: tableName, reason: result.reason || "No reason" });
            } else {
                migrationResults.failed.push({ table: tableName, error: result.error || "No error" });
            }
        }

        // Print final summary
        const totalEvents = await db.select({ count: count() }).from(boardEvents).limit(1);

        console.log("\nMigration Summary:");
        console.log(`Total events migrated: ${totalEvents[0]?.count}`);
        console.log(`Successful: ${migrationResults.successful.length} tables`);
        console.log(`Skipped: ${migrationResults.skipped.length} tables`);
        console.log(`Failed: ${migrationResults.failed.length} tables`);

        if (migrationResults.skipped.length > 0) {
            console.log("\nSkipped Tables:");
            const maxToShow = 5;
            migrationResults.skipped.slice(0, maxToShow).forEach(({ table, reason }) => {
                console.log(`- ${table}: ${reason}`);
            });
            if (migrationResults.skipped.length > maxToShow) {
                console.log(`... (${migrationResults.skipped.length - maxToShow} more)`);
            }
        }

        if (migrationResults.failed.length > 0) {
            console.log("\nFailed Tables:");
            migrationResults.failed.forEach(({ table, error }) => {
                console.log(`- ${table}: ${error}`);
            });
        }
    } catch (error) {
        console.error("Migration error:", error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

migrateData().catch(console.error);
