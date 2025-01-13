ALTER TABLE "plan_model_limits" ADD COLUMN "plan_version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;