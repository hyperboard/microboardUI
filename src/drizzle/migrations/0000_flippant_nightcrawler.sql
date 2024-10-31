CREATE TABLE IF NOT EXISTS "board_events" (
	"log_id" bigserial PRIMARY KEY NOT NULL,
	"board_id" integer NOT NULL,
	"event_id" varchar(32),
	"event_body" jsonb
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "board_edit_link" (
	"board_id" integer,
	"edit_link_uuid" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "board_view_link" (
	"board_id" integer,
	"view_link_uuid" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "board_owner" (
	"board_id" integer,
	"owner_id" integer,
	CONSTRAINT "board_owner_board_id_owner_id_pk" PRIMARY KEY("board_id","owner_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "board_permissions" (
	"board_id" integer,
	"user_id" integer,
	"can_view" boolean DEFAULT false,
	"can_edit" boolean DEFAULT false,
	CONSTRAINT "board_permissions_board_id_user_id_pk" PRIMARY KEY("board_id","user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "boards" (
	"id" serial PRIMARY KEY NOT NULL,
	"uniq_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"created" timestamp DEFAULT now(),
	"boardname" text,
	"author_key" uuid,
	"is_public" boolean DEFAULT false NOT NULL,
	CONSTRAINT "boards_uniq_id_unique" UNIQUE("uniq_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_board_id" (
	"user_id" integer NOT NULL,
	"board_uuid" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "board_snapshots" (
	"id" serial PRIMARY KEY NOT NULL,
	"board_id" integer,
	"snapshot" jsonb,
	"last_event_order" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_edit_link" (
	"user_id" integer,
	"edit_link_uuid" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_view_link" (
	"user_id" integer,
	"view_link_uuid" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_name" (
	"user_id" integer,
	"name" varchar(100)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_passcode" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"passcode" varchar(10),
	"created" timestamp DEFAULT now(),
	"remaining_attempts" integer DEFAULT 5 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "password_reset_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"token" varchar(100),
	"expiration_time" timestamp,
	CONSTRAINT "password_reset_requests_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_password" (
	"user_id" integer,
	"password" varchar(100)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(254),
	"activated" boolean DEFAULT false,
	"refresh_token" varchar
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "board_events" ADD CONSTRAINT "board_events_board_id_boards_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."boards"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "board_edit_link" ADD CONSTRAINT "board_edit_link_board_id_boards_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."boards"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "board_view_link" ADD CONSTRAINT "board_view_link_board_id_boards_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."boards"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "board_owner" ADD CONSTRAINT "board_owner_board_id_boards_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."boards"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "board_owner" ADD CONSTRAINT "board_owner_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "board_permissions" ADD CONSTRAINT "board_permissions_board_id_boards_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."boards"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "board_permissions" ADD CONSTRAINT "board_permissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_board_id" ADD CONSTRAINT "user_board_id_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "board_snapshots" ADD CONSTRAINT "board_snapshots_board_id_boards_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."boards"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_edit_link" ADD CONSTRAINT "user_edit_link_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_view_link" ADD CONSTRAINT "user_view_link_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_name" ADD CONSTRAINT "user_name_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_passcode" ADD CONSTRAINT "user_passcode_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "password_reset_requests" ADD CONSTRAINT "password_reset_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_password" ADD CONSTRAINT "user_password_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "board_id_last_event_order" ON "board_snapshots" USING btree ("board_id","last_event_order");