CREATE TABLE "outreach_profiles" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"resume_text" text,
	"resume_format" text DEFAULT 'text' NOT NULL,
	"resume_pdf_path" text,
	"personalization" text,
	"linkedin_url" text,
	"portfolio_url" text,
	"templates" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "outreach_profiles" ADD CONSTRAINT "outreach_profiles_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "outreach_profiles" ENABLE ROW LEVEL SECURITY;
