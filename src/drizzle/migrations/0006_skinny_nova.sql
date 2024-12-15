DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'user_avatars' AND column_name = 'generated'
    ) THEN
        ALTER TABLE "user_avatars" ADD COLUMN "generated" boolean DEFAULT true NOT NULL;
    END IF;
END $$;
--> statement-breakpoint
