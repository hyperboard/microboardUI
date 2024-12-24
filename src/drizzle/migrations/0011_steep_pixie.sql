CREATE TABLE IF NOT EXISTS "files" (
	"id" serial PRIMARY KEY NOT NULL,
	"embedding" vector(1536),
	"link" text NOT NULL,
	"board_id" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tariff_types" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"monthly_token_limit" integer NOT NULL,
	"is_free_tariff" boolean DEFAULT false,
	"reset_period_days" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "token_usages" (
	"id" varchar PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"tariff_type_id" varchar NOT NULL,
	"tokens_used" integer DEFAULT 0,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"is_current" boolean DEFAULT true
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "current_tariff_id" varchar;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "tariff_start_date" timestamp;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "files" ADD CONSTRAINT "files_board_id_boards_uniq_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."boards"("uniq_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "token_usages" ADD CONSTRAINT "token_usages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "token_usages" ADD CONSTRAINT "token_usages_tariff_type_id_tariff_types_id_fk" FOREIGN KEY ("tariff_type_id") REFERENCES "public"."tariff_types"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_current_tariff_id_tariff_types_id_fk" FOREIGN KEY ("current_tariff_id") REFERENCES "public"."tariff_types"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
