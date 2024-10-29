import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import path, { dirname } from "path";

const main = async () => {
    console.log("Running a migration...");

    console.log("mig folder: ", "./migrations");
    console.log("DB URL: ", process.env.DATABASE_URL);

    const sql = new pg.Client({
        connectionString: process.env.DATABASE_URL,
    });

    await sql.connect();

    const db = drizzle(sql);

    try {
        console.log("Migrating...");

        await migrate(db, {
            migrationsSchema: "public",
            migrationsFolder: path.resolve(dirname(__filename), "./migrations"),
        });

        console.log("Migration successful");
    } catch (error) {
        console.error(error);
        process.exit(1);
    } finally {
        await sql.end();
    }

    return true;
};

main();
