CREATE TABLE IF NOT EXISTS "user_crypto_checkout" (
	"id" varchar PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"plan_id" varchar NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"status" varchar DEFAULT 'active' NOT NULL,
	"crypto_symbol" varchar NOT NULL,
	"crypto_chain" varchar NOT NULL,
	"crypto_wallet" varchar NOT NULL,
	"crypto_price" varchar NOT NULL,
	"transaction_hash" varchar
);
--> statement-breakpoint
ALTER TABLE "user_plans" ADD COLUMN "transaction_hash" varchar;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_crypto_checkout" ADD CONSTRAINT "user_crypto_checkout_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_crypto_checkout" ADD CONSTRAINT "user_crypto_checkout_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
