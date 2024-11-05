ALTER TABLE "board_snapshots" DROP CONSTRAINT "board_snapshots_board_id_boards_uniq_id_fk";
--> statement-breakpoint
ALTER TABLE "board_snapshots" ALTER COLUMN "board_id" SET DATA TYPE integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "board_snapshots" ADD CONSTRAINT "board_snapshots_board_id_boards_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."boards"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
