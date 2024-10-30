CREATE TABLE IF NOT EXISTS "board_events" (
	"log_id" bigserial PRIMARY KEY NOT NULL,
	"board_id" integer NOT NULL,
	"event_id" varchar(32),
	"event_body" jsonb
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_board_id" (
	"user_id" integer NOT NULL,
	"board_uuid" uuid
);
--> statement-breakpoint
ALTER TABLE "boards" ALTER COLUMN "uniq_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "email" SET DATA TYPE varchar(254);--> statement-breakpoint
ALTER TABLE "boards" ADD COLUMN "is_public" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "board_snapshots" ADD COLUMN "id" serial PRIMARY KEY NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "board_events" ADD CONSTRAINT "board_events_board_id_boards_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."boards"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_board_id" ADD CONSTRAINT "user_board_id_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
