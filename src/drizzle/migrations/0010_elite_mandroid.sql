ALTER TABLE "message" ADD COLUMN "status" text DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "message" ADD COLUMN "updated_from" integer;--> statement-breakpoint
ALTER TABLE "message" ADD COLUMN "generated_from" integer;