CREATE TABLE IF NOT EXISTS "templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"uniq_id" uuid NOT NULL,
	"board_id" integer,
	"name" jsonb NOT NULL,
	"description" jsonb NOT NULL,
	"created" timestamp DEFAULT now(),
	"languages" text[] NOT NULL,
	"preview" text,
	"tags" text[] NOT NULL,
	"snapshot" jsonb NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "templates" ADD CONSTRAINT "templates_board_id_boards_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."boards"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
