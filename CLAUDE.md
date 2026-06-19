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

## Coding conventions

Domain-specific standards live in the project skills (`.claude/skills/`):
`frontend`, `backend`, `testing-and-quality`, `security-and-privacy`. They load
automatically when relevant. The always-on basics:

### Writing (copy, commits, comments, everything)

- **Never use em dashes (`—`).** Anywhere: UI copy, landing pages, commit
  messages, code comments, docs, PR text. Rewrite with a period, comma, or
  parentheses instead. (En dashes in numeric ranges like `1–10` are fine.)
- Keep copy short and plain. Prefer one tight sentence over two long ones; cut
  filler. Cheeky-but-professional, never salesy or cluttered.

### Commit messages

- **One casual sentence, usually 2–9 words.** Lowercase, plain English.
- **No `type: description` / conventional-commit prefixes.** Never write
  `feat:`, `fix:`, `docs:`, `chore:`, etc.
- Describe what changed, not ceremony.
- Good: `add startups list page`, `fix nightly refresh dedupe`,
  `load yc companies into the db`, `tidy up the dashboard copy`.
- Bad: `feat: add startups list page`, `docs(readme): update setup steps`,
  `Refactored the entire data-access layer to improve maintainability`.

### Code style

- TypeScript strict; **no `any`** (see `testing-and-quality`). Let inference
  work; type the public boundaries.
- Match the surrounding file's style, import ordering, and comment density.
  Comment the _why_, not the _what_; don't leave `console.log` in committed code.
- Prefer small, single-purpose functions; extract a `src/lib/*` helper once
  logic is shared. Use the `@/*` path alias for imports from `src`.
- A change isn't done until `pnpm typecheck` and `pnpm lint` are green. Edited
  files are auto-formatted (Prettier) on save via a hook.

### File / folder structure

- `src/app/(auth)/` — login, signup, sign-out actions.
- `src/app/(app)/` — authed shell (dashboard, startups, tracker, settings);
  `_components/` holds shell-only UI.
- `src/app/admin/` — admin-only, behind `requireAdmin`.
- `src/app/api/` — route handlers (cron, stripe webhook, health).
- `src/db/` — Drizzle schema, client (`getDb`), migrations, seed/refresh CLIs.
- `src/lib/` — shared server logic (auth, supabase clients, openrouter, stripe,
  yc refresh, env, utils). Reusable business logic goes here, not in routes.
- `src/components/ui/` — shadcn-style primitives; reuse before hand-rolling.
- Routing middleware is `src/proxy.ts` (Next 16), not `middleware.ts`.

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
