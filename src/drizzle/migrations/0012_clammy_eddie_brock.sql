CREATE TABLE IF NOT EXISTS "ai_models" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"display_name" varchar NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "plan_model_limits" (
	"id" text PRIMARY KEY NOT NULL,
	"plan_id" varchar NOT NULL,
	"model_id" varchar NOT NULL,
	"daily_request_limit" integer,
	"weekly_request_limit" integer,
	"is_enabled" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "plans" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"description" varchar,
	"monthly_token_limit" integer NOT NULL,
	"reset_period_days" integer,
	"price" integer NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"storage_limit" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_model_usage" (
	"id" varchar PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"model_id" varchar NOT NULL,
	"request_count" integer DEFAULT 0 NOT NULL,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"period_type" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_plans" (
	"id" varchar PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"plan_id" varchar NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"status" varchar DEFAULT 'active' NOT NULL,
	"canceled_at" timestamp,
	"stripe_subscription_id" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_storage_usage" (
	"id" varchar PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"total_bytes" integer DEFAULT 0 NOT NULL,
	"last_updated" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_current_tariff_id_tariff_types_id_fk";
ALTER TABLE "users" DROP COLUMN IF EXISTS "current_tariff_id";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "tariff_start_date";
DROP TABLE "token_usages";--> statement-breakpoint
DROP TABLE "tariff_types";--> statement-breakpoint
--> statement-breakpoint
ALTER TABLE "message" ALTER COLUMN "chat_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "files" ALTER COLUMN "embedding" SET DATA TYPE vector(768);--> statement-breakpoint
ALTER TABLE "message" ADD COLUMN "item_id" text;--> statement-breakpoint
ALTER TABLE "message" ADD COLUMN "previous_message_id" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plan_model_limits" ADD CONSTRAINT "plan_model_limits_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plan_model_limits" ADD CONSTRAINT "plan_model_limits_model_id_ai_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."ai_models"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_model_usage" ADD CONSTRAINT "user_model_usage_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_model_usage" ADD CONSTRAINT "user_model_usage_model_id_ai_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."ai_models"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_plans" ADD CONSTRAINT "user_plans_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_plans" ADD CONSTRAINT "user_plans_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_storage_usage" ADD CONSTRAINT "user_storage_usage_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
