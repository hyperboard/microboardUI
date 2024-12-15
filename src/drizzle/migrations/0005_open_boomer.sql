DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'access_key_type') THEN
        CREATE TYPE "public"."access_key_type" AS ENUM('view', 'edit');
    END IF;
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
END $$;
--> statement-breakpoint

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'direct_access_type') THEN
        CREATE TYPE "public"."direct_access_type" AS ENUM('view', 'edit');
    END IF;
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."folder_type" AS ENUM('root', 'nested', 'visited', 'trash', 'drafts');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "access_keys" (
	"id" serial PRIMARY KEY NOT NULL,
	"board_id" integer NOT NULL,
	"key_uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"key_type" "access_key_type" DEFAULT 'view' NOT NULL,
	CONSTRAINT "access_keys_key_uuid_unique" UNIQUE("key_uuid")
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
DROP TABLE "user_board_id";--> statement-breakpoint
ALTER TABLE "board_owner" ALTER COLUMN "board_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "board_owner" ALTER COLUMN "owner_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "board_permissions" ALTER COLUMN "board_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "board_permissions" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "boards" ALTER COLUMN "boardname" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "email" SET NOT NULL;--> statement-breakpoint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'boards' AND column_name = 'direct_access_type'
    ) THEN
        ALTER TABLE "boards" ADD COLUMN "direct_access_type" "direct_access_type" DEFAULT 'edit' NOT NULL;
    END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "access_keys" ADD CONSTRAINT "access_keys_board_id_boards_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."boards"("id") ON DELETE cascade ON UPDATE no action;
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
CREATE UNIQUE INDEX IF NOT EXISTS "folder_id_contains_board_id_idx" ON "folders_to_boards" USING btree ("folder_id","contains_border_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "folder_id_contains_folder_id_idx" ON "folders_to_folders" USING btree ("folder_id","contains_folder_id");--> statement-breakpoint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'users_email_unique' AND conrelid = 'users'::regclass
    ) THEN
        ALTER TABLE "users" ADD CONSTRAINT "users_email_unique" UNIQUE("email");
    END IF;
END $$;
--> statement-breakpoint
