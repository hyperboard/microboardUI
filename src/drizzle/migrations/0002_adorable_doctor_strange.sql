CREATE TABLE IF NOT EXISTS "user_avatars" (
	"user_id" integer,
	"avatar" varchar,
	CONSTRAINT "user_avatars_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_avatars" ADD CONSTRAINT "user_avatars_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
