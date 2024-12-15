DO $$ 
BEGIN
    -- Alter "chat_id" column to set its data type to integer, if necessary
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'message' AND column_name = 'chat_id'
    ) THEN
        ALTER TABLE "message" ALTER COLUMN "chat_id" SET DATA TYPE integer;
    END IF;

    -- Drop NOT NULL constraint from "chat_id" column, if necessary
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'message' AND column_name = 'chat_id'
    ) THEN
        ALTER TABLE "message" ALTER COLUMN "chat_id" DROP NOT NULL;
    END IF;

    -- Alter "role" column to set its data type to text, if necessary
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'message' AND column_name = 'role'
    ) THEN
        ALTER TABLE "message" ALTER COLUMN "role" SET DATA TYPE text;
    END IF;

    -- Add "created_at" column to "chat" table, if it doesn't already exist
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'chat' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE "chat" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;
    END IF;

    -- Add "active" column to "chat" table, if it doesn't already exist
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'chat' AND column_name = 'active'
    ) THEN
        ALTER TABLE "chat" ADD COLUMN "active" boolean DEFAULT true NOT NULL;
    END IF;

    -- Add "board_id" column to "chat" table, if it doesn't already exist
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'chat' AND column_name = 'board_id'
    ) THEN
        ALTER TABLE "chat" ADD COLUMN "board_id" integer NOT NULL;
    END IF;

    -- Add "tokens_used" column to "message" table, if it doesn't already exist
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'message' AND column_name = 'tokens_used'
    ) THEN
        ALTER TABLE "message" ADD COLUMN "tokens_used" integer DEFAULT 0 NOT NULL;
    END IF;

    -- Add "created_at" column to "message" table, if it doesn't already exist
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'message' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE "message" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;
    END IF;

    -- Add "archived" column to "message" table, if it doesn't already exist
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'message' AND column_name = 'archived'
    ) THEN
        ALTER TABLE "message" ADD COLUMN "archived" boolean DEFAULT false NOT NULL;
    END IF;

    -- Add the foreign key constraint for "board_id" in "chat" table
    -- BEGIN
    --     ALTER TABLE "chat" ADD CONSTRAINT "chat_board_id_boards_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."boards"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
    -- EXCEPTION
    --     WHEN duplicate_object THEN null;
    -- END;
END $$;
--> statement-breakpoint
