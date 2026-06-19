ALTER TABLE "startups" ADD COLUMN "logo_url" text;--> statement-breakpoint
ALTER TABLE "startups" ADD COLUMN "stage" text;--> statement-breakpoint
ALTER TABLE "startups" ADD COLUMN "location" text;--> statement-breakpoint
CREATE INDEX "startups_stage_idx" ON "startups" USING btree ("stage");--> statement-breakpoint
CREATE INDEX "startups_team_size_idx" ON "startups" USING btree ("team_size");