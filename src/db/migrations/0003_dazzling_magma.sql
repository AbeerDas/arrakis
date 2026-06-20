CREATE TYPE "public"."signal_source" AS ENUM('github', 'hackernews', 'news');--> statement-breakpoint
CREATE TABLE "startup_signals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"startup_id" uuid NOT NULL,
	"source" "signal_source" NOT NULL,
	"payload" jsonb NOT NULL,
	"captured_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "startups" ADD COLUMN "github_url" text;--> statement-breakpoint
ALTER TABLE "startups" ADD COLUMN "github_resolved_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "startup_signals" ADD CONSTRAINT "startup_signals_startup_id_startups_id_fk" FOREIGN KEY ("startup_id") REFERENCES "public"."startups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "startup_signals_latest_idx" ON "startup_signals" USING btree ("startup_id","source","captured_at" DESC NULLS LAST);--> statement-breakpoint
-- RLS default-deny: app code uses the privileged connection; PostgREST/anon sees nothing.
ALTER TABLE "startup_signals" ENABLE ROW LEVEL SECURITY;