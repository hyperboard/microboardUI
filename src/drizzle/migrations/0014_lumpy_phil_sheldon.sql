ALTER TABLE "message" ADD COLUMN "symbol_used" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN "text_to_speech_limit" integer NOT NULL;