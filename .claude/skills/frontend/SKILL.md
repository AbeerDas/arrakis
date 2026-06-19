---
name: frontend
description: Standards for writing UI in this repo — React 19 + Next.js 16 App Router, Tailwind v4, and the local shadcn-style primitives. Use when creating or editing anything under `src/app/**` that renders UI, any `src/components/**` file, adding a page/layout/loading/error boundary, deciding server vs client components, using `'use client'`, reading `params`/`searchParams`, wiring forms/server actions to the UI, or applying Tailwind classes. Trigger before writing JSX/TSX.
---

# Frontend standards (Next 16 + React 19 + Tailwind v4)

This is **Next.js 16** — APIs differ from older versions. When unsure about a
Next API, read `node_modules/next/dist/docs/` before writing code.

## Server vs client components

- **Server Components are the default.** Every file under `src/app/**` is a
  server component unless it starts with `'use client'`. Keep it that way.
- Add `'use client'` **only** when you need `useState`/`useEffect`, event
  handlers, refs, or browser APIs. Push the boundary as deep as possible — make
  the small interactive leaf a client component, not the whole page.
- Server components fetch data directly (Drizzle via `getDb()`), `async`/`await`
  in the component body. Never fetch your own API route from a server component.
- Never import server-only code (`@/db`, `@/lib/auth`, secrets) into a file that
  has `'use client'`.

## Next 16 specifics (these bite)

- `params` and `searchParams` are **Promises** — type them as `Promise<{…}>`
  and `await` them. See `src/app/(app)/startups/page.tsx` for the pattern.
- `cookies()` is **async** — `await cookies()`.
- Routing middleware lives in `src/proxy.ts` (not `middleware.ts`), exported as
  `proxy`. The real auth boundary is in layouts (`requireUser`/`requireAdmin`);
  the proxy is only an optimistic redirect.
- Render must be **pure**: no `Date.now()`/`Math.random()` during render (the
  lint rule blocks it). Compute time-relative flags in SQL or pass them in — see
  the `isNew` flag in the startups query.

## Components & styling

- Reuse the primitives in `src/components/ui/` (`Button`, `Input`, `Card`,
  `Label`). Don't hand-roll a styled button.
- For a link styled as a button, apply `buttonVariants({…})` to `<Link>` — do
  **not** wrap `<Link>` in `<Button>` (invalid nested interactive HTML).
- Tailwind v4: use the design tokens already defined in `globals.css`
  (`bg-card`, `text-muted-foreground`, `border-input`, etc.) instead of raw
  colors, so dark mode and theming keep working.
- Compose classes with `cn()` from `@/lib/utils`.

## Forms, data & UX states

- Mutations go through **server actions** (`'use server'`), not client fetches.
  Pair them with `useActionState`/`useFormStatus` for pending/error UI.
- Give every async route its sibling `loading.tsx`, and an `error.tsx` where a
  failure is plausible. Always handle the empty state explicitly.
- Use `next/link` for internal navigation and `next/image` for images.
- Keep accessibility in mind: real `<label>`s tied to inputs, alt text, focus
  states (the primitives already include `focus-visible` rings — preserve them).
