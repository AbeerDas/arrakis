@AGENTS.md

# Arrakis — project guide

Job/internship outreach platform: discover early-stage startups, send
resume-backed cold emails, track applications, with a paid tier for manually
verified founder contacts and an admin-only anonymized moat dashboard.

## Decided stack & conventions

- **Next.js 16 App Router + TypeScript**, one repo. Note: this is Next **16** —
  `middleware.ts` is now `proxy.ts`; `cookies()` is async; route `params` are
  Promises. Read `node_modules/next/dist/docs/` before using an unfamiliar API.
- **Supabase** for Postgres + auth (email/password only) + Storage (resumes).
- **Drizzle ORM** owns the schema/migrations (`src/db/schema.ts`).
- **Data access is server-side via Drizzle** using the privileged Postgres
  connection. RLS is enabled default-deny on every table (the auto PostgREST API
  exposes nothing); authz is enforced in app code (`src/lib/auth.ts`). Do not
  switch to RLS-policy + client-side queries without a deliberate decision.
- `is_admin` / `is_paid` are plain boolean columns on `profiles`, checked
  server-side. No separate roles/permissions system at this scale.
- **Paid status flips via the Stripe webhook** (`/api/stripe/webhook`), never by
  polling. Stripe is stubbed until the account exists.
- **Email generator uses OpenRouter** (OpenAI-compatible; model via
  `OPENROUTER_MODEL`). Secrets are env vars only — never hardcode keys.
- Nightly YC refresh is a **Vercel Cron** route (`/api/cron/refresh-yc`), not a
  separate worker.

## Privacy hard lines (do NOT cross without an explicit new product decision)

- `tracker_entries.sent_email_body` is **write-only**: stored for the owning user
  only. No admin view/export/aggregate query may read it. The column exists for a
  possible future feature — building a reader is a separate, explicit decision.
- **No reply content is stored anywhere**, by anyone, ever.
- The moat dashboard is **admin-only** and uses **only anonymized aggregates**
  (counts, stage distribution, custom stage labels) — never written content,
  never tied to an identifiable user.

## Explicitly rejected ideas (do not silently re-add)

Best-time-to-reach-out signal; school/network affiliation signals; auto-pulling
news/launches into email drafts; admin visibility into individual sent emails;
reply storage of any kind; subscription or per-contact billing.

## Data sourcing rule

Pull YC data only from **yc-oss/api**. Do **not** write scrapers against
ycombinator.com, wellfound.com, crunchbase.com, or techstars.com (their ToS
prohibit it). Techstars / 500 Global are manual-curation-only at MVP.

## Still undecided (flag before baking in)

Free teaser-set selection logic; whether paid access auto-includes contacts added
after purchase (current assumption: yes); refund policy; the preference-vs-one-off
threshold for email-edit learning.
