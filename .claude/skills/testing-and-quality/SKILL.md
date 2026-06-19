---
name: testing-and-quality
description: Conventions for TypeScript code quality and tests in this repo — type strictness, naming, error handling, and how/what to test. Use when writing or refactoring any `.ts`/`.tsx`, adding tests, reviewing code quality, deciding what to extract or how to name things, or before finishing a change (run typecheck + lint). Trigger when tempted to reach for `any`, when a function grows complex, or when adding test coverage.
---

# TypeScript quality & testing

## Type strictness

- **No `any`.** Prefer precise types, `unknown` + narrowing, or generics. If you
  truly need an escape hatch, leave a comment explaining why.
- Don't add non-null assertions (`!`) or casts to silence the compiler — fix the
  type. Let inference work; annotate exported/public boundaries.
- Validate all external input (request bodies, env, third-party JSON) with `zod`
  and derive the TS type from the schema, rather than asserting a shape.
- Model "this or that" with discriminated unions, not optional-field soup.

## Naming & structure

- Descriptive names: functions are verbs (`refreshYcStartups`), booleans read as
  predicates (`isNew`, `isAdmin`). No abbreviations that aren't already used here.
- Keep functions small and single-purpose; extract a `src/lib/*` helper once
  logic is reused or a component/route gets long. Co-locate one-off helpers.
- Match the surrounding code's style, import ordering, and comment density.
  Comment the *why*, not the *what*.

## Error handling

- Don't swallow errors. Catch only where you can add context or recover;
  otherwise let it propagate.
- In route handlers, catch fallible work and return a clean typed error with the
  right status — never leak a stack trace to the client.
- Fail fast on misconfiguration (missing env) with a clear message (`requireEnv`).
- No `console.log` left in committed code; remove debug logging.

## Before finishing any change

Always run and get them green:

```bash
pnpm typecheck   # tsc --noEmit
pnpm lint        # eslint
```

A change isn't done until both pass.

## Testing

> No test runner is configured yet. If a task involves adding the first tests,
> propose **Vitest** (+ React Testing Library for components) to the user before
> installing — don't pull in a framework unprompted.

When tests exist, follow these:

- Test **behavior and contracts**, not implementation details. A refactor that
  preserves behavior should not break tests.
- Cover the unhappy paths: empty results, unauthorized access, invalid input,
  boundary values — these are where bugs in this app will live.
- Prioritize the security-critical seams: authz scoping (a user can't read
  another user's rows), the `CRON_SECRET` gate, the Stripe webhook, and the
  privacy hard lines (no admin read of `sent_email_body`).
- Keep tests deterministic — no real network, no `Date.now()`/random without
  control. Name tests by the behavior they assert.
