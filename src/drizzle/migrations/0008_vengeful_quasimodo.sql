CREATE TABLE IF NOT EXISTS "custom_plan_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP TABLE "user_model_usage";--> statement-breakpoint
ALTER TABLE "message" ADD COLUMN "model" text DEFAULT 'unsupported' NOT NULL;--> statement-breakpoint
ALTER TABLE "user_plans" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "custom_plan_requests" ADD CONSTRAINT "custom_plan_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
