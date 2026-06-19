---
name: security-and-privacy
description: This project's security and privacy rules — secret hygiene, input validation, authorization discipline, and the non-negotiable privacy hard lines. Use when handling secrets/env vars, writing auth or any user-scoped/admin query, touching `tracker_entries.sent_email_body`, the moat/admin dashboard, the Stripe webhook, the cron endpoint, resume/file uploads, or anything that reads/writes user content. Trigger before code that touches data ownership, money, secrets, or aggregates.
---

# Security & privacy (non-negotiable)

These overlap with the privacy hard lines in CLAUDE.md. When in doubt, stop and
ask — crossing a privacy line is a product decision, not a coding one.

## Privacy hard lines — do NOT cross without an explicit product decision

- **`tracker_entries.sent_email_body` is write-only.** It may be written for the
  owning user only. No admin view, export, aggregate, or analytics query may
  ever read it. Don't build a reader.
- **Never store reply content** anywhere, by anyone, ever.
- **The moat/admin dashboard is admin-only and anonymized-aggregates-only** —
  counts, stage distribution, custom stage labels. Never written content, never
  joined or traceable back to an identifiable user.
- Don't silently re-add rejected ideas (admin visibility into individual emails,
  reply storage, best-time-to-reach signals, network/affiliation signals).

## Secrets

- Secrets are **env vars only** — never hardcode keys, tokens, or connection
  strings, and never commit them. Read via `requireEnv`/`process.env`.
- `.env*` is gitignored (only `.env.example` is committed) and a hook blocks
  staging env files — keep it that way; never force-add a secret file.
- Never log secrets, full connection strings, tokens, or raw request auth
  headers. Don't echo env values in error messages returned to clients.
- The Supabase **service-role / secret key** and `DATABASE_URL`/`DIRECT_URL` are
  server-only. Never expose them to the client or a `NEXT_PUBLIC_*` var.

## Authorization

- Every request that touches data starts with `requireUser()`/`requireAdmin()`.
  Derive the user id from the session — never from a request param/body.
- Scope every user-owned query by the session user's id. Re-check ownership on
  mutations; don't assume a passed id belongs to the caller.
- Webhook/cron endpoints must verify their secret (Stripe signature,
  `CRON_SECRET` bearer) and reject otherwise — never leave them open.
- Paid/admin gating is checked server-side every time; never trust a client flag.

## Input & data handling

- Validate and narrow all external input with `zod` before use (request bodies,
  webhook payloads, third-party JSON, file metadata).
- Drizzle parameterizes queries — keep using it; never build SQL by string
  concatenation of user input.
- For resume uploads: validate type/size, store in the resume Storage bucket,
  and never trust the client-provided path or content type blindly.
- Data sourcing: pull YC data only from yc-oss/api. Do **not** add scrapers
  against ycombinator.com, wellfound.com, crunchbase.com, or techstars.com.
