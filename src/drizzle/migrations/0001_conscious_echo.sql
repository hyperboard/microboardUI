-- Modify the primary key constraint and drop the old serial primary key
ALTER TABLE "board_events" DROP CONSTRAINT IF EXISTS "board_events_pkey";
ALTER TABLE "board_events" DROP COLUMN IF EXISTS "log_id";
ALTER TABLE "board_events" ADD COLUMN "log_id" bigint NOT NULL;
ALTER TABLE "board_events" ADD PRIMARY KEY ("board_id", "log_id");

-- Ensure the existing index is created or replaced
DROP INDEX IF EXISTS "board_id_log_id_idx";
CREATE INDEX "board_id_log_id_idx" ON "board_events" USING btree ("board_id", "log_id");