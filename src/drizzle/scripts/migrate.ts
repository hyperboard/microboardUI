import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import path, { dirname } from "path";

export const runMigration = async () => {
    console.log("Running a migration...");
    const migrationsFolder = process.env.MIGRATIONS_FOLDER;
    const dbUrl = process.env.DATABASE_URL;

    if (!migrationsFolder || !dbUrl) {
        if (!migrationsFolder) {
            console.error("MIGRATIONS_FOLDER env variable is not set.");
        }

        if (!dbUrl) {
            console.error("DATABASE_URL env variable is not set.");
        }
        console.error("Terminate migration...");
        return;
    }

    console.log("mig folder: ", migrationsFolder);
    console.log("DB URL: ", dbUrl);

    const sql = new pg.Client({
        connectionString: dbUrl,
    });

    await sql.connect();

    const db = drizzle(sql);

    try {
        console.log("Migrating...");

        const migrationsFolderPath = path.resolve(dirname(__filename), migrationsFolder);
        console.log("Migrations Folder Path:", migrationsFolderPath);
        await migrate(db, {
            migrationsSchema: "public",
            migrationsFolder: migrationsFolderPath,
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
