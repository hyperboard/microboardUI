import { Pool } from "pg";

export async function createVectorExtension(pool: Pool) {
    const client = await pool.connect();
    try {
        await client.query(`
        DO $$ BEGIN
          IF NOT EXISTS (SELECT FROM pg_extension WHERE extname = 'vector') THEN
            CREATE EXTENSION IF NOT EXISTS "vector";
          END IF;
        END $$;
      `);
        console.log("pg_vector extension is ensured.");
    } catch (error) {
        console.error("Error ensuring pg_vector extension:", error);
    } finally {
        client.release();
    }
}
