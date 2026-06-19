---
name: design-system
description: Arrakis's visual design language — the "Dune" soft-white/ink aesthetic, liquid glass, bold sans display type, subtle motion, and the anti-generic-component rules. Use when building or restyling ANY user-facing UI: the landing/marketing pages, app screens, new components, or anything visual. Trigger before writing JSX that renders UI, choosing colors/spacing/type, adding cards/lists/headers/sections, or adding animation. Read docs/design.md for the full manifesto.
---

# Arrakis design system

Full manifesto: **`docs/design.md`** — read it for anything non-trivial. This is
the fast checklist.

## The vibe

Modern, sleek, minimal **"Dune"** — soft warm-white light, vast negative space,
bold sans display type, one glow of spice. Calm and cinematic. Three pillars:
**warm & cinematic**, **liquid glass**, **quietly alive** (subtle blur-in +
parallax + slow motion).

## Hard rules (don't violate without asking)

- **No obvious shadcn-isms.** No grids of equal bordered card tiles; no plain
  "title + muted subheading" header stacks; no untouched stock chrome.
- **Lists are flat by default** (quiet rows + hairline dividers), card/grid as an
  optional toggle — not the reverse.
- **Headers are rich**: small letterspaced spice eyebrow → bold sans display
  title → body. Not a basic two-line stack.
- **Use tokens, never raw colors.** `bg-background` (soft white), `text-foreground`
  (ink), `text-spice`/`bg-spice` (the one brown/amber accent), `border-border`.
- **Spice is rationed** — eyebrows, links, a glow, one highlight. Buttons stay ink
  (`primary`).
- **Respect `prefers-reduced-motion`** — always (the primitives already do).

## Building blocks

- Type: `font-sans` (Geist) everywhere. Headlines big and heavy
  (`font-bold`/`font-extrabold`), `tracking-tight`, `text-balance`. Do NOT use
  `font-serif` on new surfaces (Playfair is still loaded but retired as display).
  Eyebrow: `text-xs uppercase tracking-[0.24em] text-spice`.
- Glass: `.glass` / `.glass-soft` (globals.css), only over the desert backdrop, a
  gradient, or scrolling content; rounded-2xl/3xl + hairline. Nav, preview cards,
  CTA panel. Not on dense tables, body text, or form controls.
- Form controls (`<select>`/`<input>`/`<textarea>`): never get glass. Selects use
  `appearance-none` + an explicit chevron, or macOS renders an ugly liquid-glass
  native control.
- Motion (`src/components/landing/`): `<Reveal delayMs>`, `<Parallax speed>` (0.06–
  0.18), `<CountUp to>`, `<LetterReveal>` (hero headline). Easing `--ease-dune`;
  reveals 0.6–0.9s; stagger, don't pile up.
- Signature graphic: the faded desert backdrop (`public/desert.jpg`) + a soft
  radial spice glow, or just negative space. No stock illustration / icons-in-
  circles.
- Writing: no em dashes anywhere (see CLAUDE.md). Keep copy short and plain.

## Voice

Cheeky but professional — a hook, not a gimmick. Confident, a little dry, never
salesy.

## Reference implementation

`src/app/page.tsx` (landing) + `src/components/site-header.tsx` (glass nav) are the
canonical examples. Match their patterns.
