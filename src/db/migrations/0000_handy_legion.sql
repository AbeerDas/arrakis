CREATE TYPE "public"."contact_origin" AS ENUM('scraped', 'verified');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'paid', 'failed', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."resume_format" AS ENUM('pdf', 'latex', 'text');--> statement-breakpoint
CREATE TABLE "contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"startup_id" uuid NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"role_title" text,
	"origin" "contact_origin" DEFAULT 'verified' NOT NULL,
	"is_teaser" boolean DEFAULT false NOT NULL,
	"added_by_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"stripe_checkout_session_id" text,
	"stripe_payment_intent_id" text,
	"amount" integer,
	"currency" text DEFAULT 'usd' NOT NULL,
	"status" "payment_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payments_stripe_checkout_session_id_unique" UNIQUE("stripe_checkout_session_id")
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"full_name" text,
	"is_admin" boolean DEFAULT false NOT NULL,
	"is_paid" boolean DEFAULT false NOT NULL,
	"paid_at" timestamp with time zone,
	"last_active_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resumes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"version_no" integer DEFAULT 1 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"format" "resume_format" NOT NULL,
	"file_path" text,
	"source_text" text,
	"parsed_summary" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "role_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"tone_notes" text,
	"base_email_body" text,
	"style_preferences" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "startups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"one_liner" text,
	"description" text,
	"website" text,
	"batch" text,
	"status" text,
	"founded_date" date,
	"industry" text,
	"subindustry" text,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"regions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"team_size" integer,
	"founder_names" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"source" text DEFAULT 'yc-oss' NOT NULL,
	"external_id" text,
	"source_data" jsonb,
	"first_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tracker_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"startup_id" uuid NOT NULL,
	"notes" text,
	"sent_email_body" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tracker_entry_stages" (
	"tracker_entry_id" uuid NOT NULL,
	"stage_id" uuid NOT NULL,
	"checked_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tracker_entry_stages_tracker_entry_id_stage_id_pk" PRIMARY KEY("tracker_entry_id","stage_id")
);
--> statement-breakpoint
CREATE TABLE "tracker_stages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"label" text NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_startup_id_startups_id_fk" FOREIGN KEY ("startup_id") REFERENCES "public"."startups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_added_by_user_id_profiles_id_fk" FOREIGN KEY ("added_by_user_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resumes" ADD CONSTRAINT "resumes_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_profiles" ADD CONSTRAINT "role_profiles_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tracker_entries" ADD CONSTRAINT "tracker_entries_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tracker_entries" ADD CONSTRAINT "tracker_entries_startup_id_startups_id_fk" FOREIGN KEY ("startup_id") REFERENCES "public"."startups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tracker_entry_stages" ADD CONSTRAINT "tracker_entry_stages_tracker_entry_id_tracker_entries_id_fk" FOREIGN KEY ("tracker_entry_id") REFERENCES "public"."tracker_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tracker_entry_stages" ADD CONSTRAINT "tracker_entry_stages_stage_id_tracker_stages_id_fk" FOREIGN KEY ("stage_id") REFERENCES "public"."tracker_stages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tracker_stages" ADD CONSTRAINT "tracker_stages_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "contacts_startup_id_idx" ON "contacts" USING btree ("startup_id");--> statement-breakpoint
CREATE INDEX "contacts_origin_idx" ON "contacts" USING btree ("origin");--> statement-breakpoint
CREATE INDEX "payments_user_id_idx" ON "payments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "resumes_user_id_idx" ON "resumes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "role_profiles_user_id_idx" ON "role_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "startups_source_external_id_key" ON "startups" USING btree ("source","external_id");--> statement-breakpoint
CREATE INDEX "startups_industry_idx" ON "startups" USING btree ("industry");--> statement-breakpoint
CREATE INDEX "startups_batch_idx" ON "startups" USING btree ("batch");--> statement-breakpoint
CREATE INDEX "startups_first_seen_at_idx" ON "startups" USING btree ("first_seen_at");--> statement-breakpoint
CREATE UNIQUE INDEX "tracker_entries_user_startup_key" ON "tracker_entries" USING btree ("user_id","startup_id");--> statement-breakpoint
CREATE INDEX "tracker_entries_user_id_idx" ON "tracker_entries" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "tracker_entries_startup_id_idx" ON "tracker_entries" USING btree ("startup_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tracker_stages_user_label_key" ON "tracker_stages" USING btree ("user_id","label");--> statement-breakpoint
-- One active resume per user (Drizzle cannot express partial unique indexes in the schema).
CREATE UNIQUE INDEX "resumes_one_active_per_user" ON "resumes" USING btree ("user_id") WHERE "is_active";--> statement-breakpoint
-- Defense-in-depth: RLS default-deny on every table, so Supabase's auto-generated
-- PostgREST/anon API exposes nothing. Server code uses the privileged Postgres
-- connection (table owner), which bypasses RLS; authorization is enforced in app code.
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "startups" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "contacts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "resumes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "role_profiles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "tracker_entries" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "tracker_entry_stages" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "tracker_stages" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "payments" ENABLE ROW LEVEL SECURITY;