CREATE TABLE IF NOT EXISTS "telegram_chats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chat_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "telegram_chats_chat_id_unique" UNIQUE("chat_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "address_nonce" (
	"id" serial PRIMARY KEY NOT NULL,
	"nonce" varchar NOT NULL,
	"crypto_wallet" varchar NOT NULL,
	"created" timestamp DEFAULT now() NOT NULL,
	"remaining_attempts" integer DEFAULT 5 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "crypto_wallet" varchar;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_crypto_wallet_unique" UNIQUE("crypto_wallet");