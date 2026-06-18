# Arrakis

A startup discovery, cold-outreach, and application-tracking platform for job
seekers. Find early-stage startups before they post jobs, reach founders with a
resume-backed AI email, and track every application — with a paid tier for
manually verified founder contacts.

> **Status:** scaffold. Auth, the database schema, and the deploy/cron pipeline
> are in place. Product features (tracker UI, email generator, paid gating,
> moat dashboard) are built on top of this foundation next.

## Stack

- **Next.js 16** (App Router, TypeScript) — frontend + API route handlers
- **Supabase** — Postgres + built-in auth (email/password) + Storage (resumes)
- **Drizzle ORM** — schema + migrations (`src/db`)
- **Tailwind CSS v4 + shadcn/ui** foundation
- **Stripe** — one-time payment, webhook-driven (stubbed until account exists)
- **OpenRouter** — email generator LLM (OpenAI-compatible; model via env)
- **Vercel** — hosting + Cron (nightly yc-oss refresh)

## Prerequisites

- Node 20+ and pnpm 10+
- A Supabase project (free tier is fine)

## Setup

```bash
pnpm install
cp .env.example .env
# Fill in .env from your Supabase project (see comments in the file).
```

Then create the schema:

```bash
pnpm db:migrate            # apply migrations to your Supabase DB (uses DIRECT_URL)
pnpm db:seed               # seed the default tracker stages
```

Finally, run the Supabase-specific linkage once in the Supabase SQL Editor:

- Paste the contents of [`supabase/auth-link.sql`](supabase/auth-link.sql) and run it.

> Row Level Security is enabled default-deny on every table by the migration, so
> Supabase's auto-generated API exposes nothing. All data access goes through
> server code via Drizzle (the privileged Postgres connection bypasses RLS);
> authorization is enforced in the app (see `src/lib/auth.ts`).

Run the app:

```bash
pnpm dev                   # http://localhost:3000
```

The user whose email matches `ADMIN_EMAIL` is auto-granted admin on first
sign-in.

## Scripts

| Script | Purpose |
| --- | --- |
| `pnpm dev` | Run the dev server |
| `pnpm build` / `pnpm start` | Production build / serve |
| `pnpm lint` / `pnpm typecheck` | ESLint / `tsc --noEmit` |
| `pnpm db:generate` | Generate a migration from `src/db/schema.ts` (offline) |
| `pnpm db:migrate` | Apply migrations (needs `DIRECT_URL`) |
| `pnpm db:push` | Push schema without a migration (dev only) |
| `pnpm db:studio` | Drizzle Studio |
| `pnpm db:seed` | Seed default tracker stages |

## Deploy (Vercel)

1. Import the GitHub repo into Vercel.
2. Add every variable from `.env.example` in the project settings (including a
   random `CRON_SECRET` — Vercel sends it to the cron route automatically).
3. Deploy. The nightly refresh in [`vercel.json`](vercel.json) calls
   `/api/cron/refresh-yc` at 08:00 UTC. Verify wiring at `/api/health`.

## Project structure

```
src/
  app/
    (auth)/          login, signup, sign-out actions
    (app)/           authed shell: dashboard, startups, tracker, settings
    admin/           admin-only moat dashboard (requireAdmin)
    blog/            MDX blog (public)
    api/             cron/refresh-yc, stripe/webhook, health
    auth/confirm/    email confirmation route handler
  db/                Drizzle schema, client, migrations, seed
  lib/               supabase clients, auth/profile helpers, stripe, openrouter, env
  components/ui/     shadcn-style primitives
  proxy.ts           Next 16 "proxy" (was middleware): session refresh + guard
```

## Data sourcing

YC data comes from [yc-oss/api](https://github.com/yc-oss/api), an open,
daily-updating mirror — we do **not** scrape ycombinator.com (or Wellfound /
Crunchbase / Techstars), all of which prohibit it. Founder *emails* are never in
any open dataset; verified contacts are added manually. See the PRD §5.1a.

## Privacy hard lines (do not cross without an explicit product decision)

- `tracker_entries.sent_email_body` is **write-only** — stored for the owner,
  never read by any admin view, export, or aggregate query.
- **No reply content is stored anywhere**, ever.
- The admin moat dashboard surfaces **only anonymized, aggregated structured
  signals** (counts, stage distribution, custom stage labels) — never a user's
  written content, never tied to an identifiable user.
