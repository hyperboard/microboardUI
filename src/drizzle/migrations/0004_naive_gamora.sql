DO $$ BEGIN
 CREATE TYPE "public"."access_key_type" AS ENUM('view', 'edit');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."direct_access_type" AS ENUM('view', 'edit');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."folder_type" AS ENUM('root', 'nested', 'visited', 'trash', 'drafts');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chat" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"board_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "message" (
	"id" serial PRIMARY KEY NOT NULL,
	"chat_id" integer NOT NULL,
	"role" text NOT NULL,
	"content" text DEFAULT '' NOT NULL,
	"tokens_used" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"archived" boolean DEFAULT false NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"updated_from" integer,
	"generated_from" integer,
	"item_id" text,
	"previous_message_id" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "access_keys" (
	"id" serial PRIMARY KEY NOT NULL,
	"board_id" integer NOT NULL,
	"key_uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"key_type" "access_key_type" DEFAULT 'view' NOT NULL,
	CONSTRAINT "access_keys_key_uuid_unique" UNIQUE("key_uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "files" (
	"id" serial PRIMARY KEY NOT NULL,
	"embedding" vector(768),
	"link" text NOT NULL,
	"board_id" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "folders" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text DEFAULT '' NOT NULL,
	"owner_id" integer NOT NULL,
	"type" "folder_type" DEFAULT 'nested' NOT NULL,
	"deleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "folders_to_boards" (
	"id" serial PRIMARY KEY NOT NULL,
	"folder_id" integer,
	"contains_border_id" integer,
	"access_key" integer,
	"order" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "folders_to_folders" (
	"id" serial PRIMARY KEY NOT NULL,
	"folder_id" integer,
	"contains_folder_id" integer,
	"order" integer
);
--> statement-breakpoint
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
ALTER TABLE "board_owner" ALTER COLUMN "board_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "board_owner" ALTER COLUMN "owner_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "board_permissions" ALTER COLUMN "board_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "board_permissions" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "boards" ALTER COLUMN "boardname" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "email" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "templates" ALTER COLUMN "uniq_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "boards" ADD COLUMN IF NOT EXISTS "direct_access_type" "direct_access_type" DEFAULT 'edit' NOT NULL;--> statement-breakpoint
ALTER TABLE "user_avatars" ADD COLUMN IF NOT EXISTS "generated" boolean DEFAULT true NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "message" ADD CONSTRAINT "message_chat_id_chat_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."chat"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "access_keys" ADD CONSTRAINT "access_keys_board_id_boards_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."boards"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "files" ADD CONSTRAINT "files_board_id_boards_uniq_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."boards"("uniq_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "folders" ADD CONSTRAINT "folders_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "folders_to_boards" ADD CONSTRAINT "folders_to_boards_folder_id_folders_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."folders"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "folders_to_boards" ADD CONSTRAINT "folders_to_boards_contains_border_id_boards_id_fk" FOREIGN KEY ("contains_border_id") REFERENCES "public"."boards"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "folders_to_boards" ADD CONSTRAINT "folders_to_boards_access_key_access_keys_id_fk" FOREIGN KEY ("access_key") REFERENCES "public"."access_keys"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "folders_to_folders" ADD CONSTRAINT "folders_to_folders_folder_id_folders_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."folders"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "folders_to_folders" ADD CONSTRAINT "folders_to_folders_contains_folder_id_folders_id_fk" FOREIGN KEY ("contains_folder_id") REFERENCES "public"."folders"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
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
CREATE UNIQUE INDEX IF NOT EXISTS "folder_id_contains_board_id_idx" ON "folders_to_boards" USING btree ("folder_id","contains_border_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "folder_id_contains_folder_id_idx" ON "folders_to_folders" USING btree ("folder_id","contains_folder_id");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_email_unique" UNIQUE("email");