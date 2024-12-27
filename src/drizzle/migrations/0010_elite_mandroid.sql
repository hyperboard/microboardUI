DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'message' AND column_name = 'status'
    ) THEN
        ALTER TABLE "message" ADD COLUMN "status" text DEFAULT 'pending' NOT NULL;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'message' AND column_name = 'updated_from'
    ) THEN
        ALTER TABLE "message" ADD COLUMN "updated_from" integer;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'message' AND column_name = 'generated_from'
    ) THEN
        ALTER TABLE "message" ADD COLUMN "generated_from" integer;
    END IF;
END $$;
