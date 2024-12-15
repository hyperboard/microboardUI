CREATE TABLE IF NOT EXISTS "user_board_id" (
	"user_id" integer NOT NULL,
	"board_uuid" uuid
);
--> statement-breakpoint
-- ALTER TABLE "chat" DROP CONSTRAINT "chat_board_id_boards_id_fk";
--> statement-breakpoint
ALTER TABLE "chat" ALTER COLUMN "board_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "chat" ALTER COLUMN "board_id" DROP NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_board_id" ADD CONSTRAINT "user_board_id_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
