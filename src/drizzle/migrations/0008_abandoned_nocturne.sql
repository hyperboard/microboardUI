CREATE TABLE IF NOT EXISTS "user_board_id" (
	"user_id" integer NOT NULL,
	"board_uuid" uuid
);
--> statement-breakpoint
ALTER TABLE "message" RENAME COLUMN "response" TO "content";--> statement-breakpoint
ALTER TABLE "message" ALTER COLUMN "chat_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "message" ALTER COLUMN "chat_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "message" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "chat" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "chat" ADD COLUMN "active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "chat" ADD COLUMN "board_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "message" ADD COLUMN "tokens_used" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "message" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "message" ADD COLUMN "archived" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "message" ADD COLUMN "status" text DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "message" ADD COLUMN "updated_from" integer;--> statement-breakpoint
ALTER TABLE "message" ADD COLUMN "generated_from" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_board_id" ADD CONSTRAINT "user_board_id_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
