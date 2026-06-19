---
name: backend
description: Standards for server-side code in this repo — Drizzle ORM queries, the schema, route handlers, server actions, and the server-side authorization model. Use when editing `src/db/**`, `src/lib/**`, `src/app/api/**`, any server action (`'use server'`), data-fetching in a server component, the Drizzle schema/migrations, or anything touching auth/`profiles`/`is_admin`/`is_paid`. Trigger before writing DB queries, route handlers, or mutations.
---

# Backend standards (Drizzle + Next route handlers + authz)

## Authorization model — enforce in app code

- Data access is **server-side via Drizzle** on the privileged connection
  (`getDb()`), which bypasses RLS. RLS is default-deny defense-in-depth — it is
  **not** your authz layer. Every query you write must be scoped in code.
- Start protected work with `requireUser()` / `requireAdmin()` from
  `@/lib/auth`. Never trust a client-supplied user id — derive it from the
  session.
- Scope every user-owned query by `userId` (e.g. `eq(table.userId, user.id)`).
  Admin-only aggregates go behind `requireAdmin()` and must stay anonymized.
- `is_admin` / `is_paid` are booleans on `profiles`, checked server-side. Paid
  status flips **only** via the Stripe webhook, never by polling.

## Drizzle query patterns

- Reuse the lazy `getDb()` singleton from `@/db`. Don't create new clients.
- Select **only the columns you need**; use `getTableColumns(table)` when you
  need all-plus-a-computed field (see the startups `isNew` flag).
- Filter with `and(...)`/`or(...)`/`eq`/`ilike`; paginate with `.limit()` +
  `.offset()`; run independent reads concurrently with `Promise.all`.
- Bulk writes: chunk large `insert().values([...])` (≤500 rows) and use
  `onConflictDoUpdate`/`onConflictDoNothing` for idempotent upserts — see
  `src/lib/yc.ts`.
- Index foreign keys and frequently-filtered/sorted columns in `schema.ts`; add
  composite/unique indexes for real query shapes and dedupe keys.
- Wrap multi-statement invariants in `db.transaction(...)`.
- Migrations: change `schema.ts`, run `pnpm db:generate`, review the SQL, then
  `pnpm db:migrate` (uses `DIRECT_URL`). Never hand-edit applied migrations.
  Supabase `auth`-schema references stay out of Drizzle (`supabase/auth-link.sql`).

## Route handlers & shared logic

- Put reusable business logic in `src/lib/*` and have both the route handler and
  any CLI/cron caller import it (cron route → `refreshYcStartups`). Don't
  duplicate logic in the route.
- Cron/admin endpoints must authorize (`CRON_SECRET` bearer check) and never be
  open. Validate external input with `zod` before trusting it.
- Return typed `NextResponse.json(...)` with correct status codes; wrap fallible
  work in try/catch and return a clean error, never a raw stack.

## Privacy hard lines (see CLAUDE.md)

- `tracker_entries.sent_email_body` is **write-only** — never read it in any
  admin/aggregate/export query.
- **Never store reply content** anywhere.
- Secrets are env vars only (`requireEnv`) — never hardcode or log them.
