ALTER TABLE "board_events" DROP CONSTRAINT "board_events_pkey";
--> statement-breakpoint
ALTER TABLE "board_events"
ALTER COLUMN "log_id"
SET DATA TYPE bigint;
--> statement-breakpoint
ALTER TABLE "board_events"
ADD CONSTRAINT "board_events_board_id_log_id_pk" PRIMARY KEY ("board_id", "log_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "board_id_log_id_idx" ON "board_events" USING btree ("board_id", "log_id");