CREATE TABLE IF NOT EXISTS "wallet_last_checked_block" (
	"id" varchar PRIMARY KEY NOT NULL,
	"crypto_wallet" varchar NOT NULL,
	"crypto_chain" varchar NOT NULL,
	"last_block_number" integer DEFAULT 0,
	CONSTRAINT "wallet_last_checked_block_crypto_wallet_crypto_chain_unique" UNIQUE("crypto_wallet","crypto_chain")
);
