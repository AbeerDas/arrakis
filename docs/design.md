# Arrakis design manifesto

The taste this product is built with. Read it before designing any surface.
The short version lives in the `design-system` skill; this is the full reference.

---

## 1. The vibe

**Modern, sleek, minimal — "Dune" (the film).** Warm desert light, vast
negative space, monolithic serif type, a single glow of spice. Calm and
confident, never busy. Editorial restraint with a cinematic edge.

Three feelings to keep hitting:

- **Warm & cinematic** — sand and ink, not clinical white/black. Light feels
  like late-afternoon desert.
- **Liquid glass** — translucent, frosted, gently gradient surfaces that let
  what's behind them bleed through.
- **Quietly alive** — things ease and blur into place, drift on scroll, breathe.
  Subtle parallax and slow motion, never flashy.

### What we are NOT

- **No obvious shadcn-isms.** Avoid the default look: rows of equal bordered
  card tiles, a title with a muted subheading stacked left-to-right, the stock
  badge/avatar/tabs chrome. If it looks like an untouched component library,
  redo it.
- **No dense tile grids by default.** Lists are **flat by default** (quiet rows,
  hairline dividers), with a card/grid view as an optional toggle — not the
  reverse. See the startups list as the reference target.
- **No basic "title + subheading" headers.** Section and page headers should be
  richer: a small letterspaced eyebrow in spice, a serif display title, then
  body — composed, not a plain stack.
- No drop-shadow soup, no loud gradients, no neon. One accent, used sparingly.

---

## 2. Color — "warm sand + ink"

Light is the canonical theme. Tokens are defined in `src/app/globals.css` as
oklch CSS variables and exposed to Tailwind via `@theme inline`. **Always use
tokens** (`bg-background`, `text-muted-foreground`, `border-border`, `text-spice`,
`bg-spice`) — never raw hex/oklch in components.

| Token                        | Role                                                                    |
| ---------------------------- | ----------------------------------------------------------------------- |
| `background`                 | warm sand surface (the page)                                            |
| `foreground`                 | warm near-black ink (text)                                              |
| `card` / `popover`           | slightly lighter warm surfaces                                          |
| `primary`                    | **ink** — primary buttons are near-black (stark, like the refs)         |
| `muted` / `muted-foreground` | warm low-contrast fills / secondary text                                |
| `accent`                     | warm hover surface                                                      |
| `spice` / `spice-foreground` | **the one accent** — brown/amber for links, eyebrows, glows, highlights |
| `border` / `input`           | warm hairlines                                                          |
| `ring`                       | focus ring (spice)                                                      |

Rules:

- **Spice is rationed.** Eyebrows, links, a glow, a single highlighted state.
  If two things on a screen fight for "the accent," remove one.
- Buttons stay ink (`primary`); spice is for emphasis, not for every CTA.
- Prefer **hairline dividers** (`divide-border`) and lots of breathing room over
  enclosing every group in a bordered box.

---

## 3. Typography

Two families, loaded in `src/app/layout.tsx`:

- **Display — Playfair Display** (`font-serif`, `--font-playfair`): high-contrast
  classical serif. Headlines, section titles, the wordmark, big numerals,
  initials. This carries the brand voice — use it generously at large sizes.
- **Body/UI — Geist Sans** (`font-sans`, default): everything else — paragraphs,
  labels, buttons, dense UI. Keep it clean and quiet.
- **Mono — Geist Mono** (`font-mono`): code, keys, the occasional data accent.

Guidance:

- Headlines: large, `font-medium`, tight tracking (`tracking-tight`),
  `leading-[1.04]`-ish, `text-balance`. Let them be big — negative space is part
  of the look.
- Eyebrows: `text-xs uppercase tracking-[0.24em] text-spice`. This is the signature
  header device — use it above titles instead of a subheading-on-top.
- Body: `text-muted-foreground`, relaxed leading, constrained measure
  (`max-w-md`/`max-w-xl`). Don't run lines full-width.
- Voice: **cheeky but professional** — a hook, not a gimmick. ("Find startups
  before they know they're hiring.") Confident, a little dry, never salesy.

---

## 4. Liquid glass

Frosted translucency is a signature, used **deliberately, not everywhere**.
Utilities in `globals.css`:

- `.glass` — primary frosted surface: `card` at ~62% + `blur(18px) saturate(150%)`
  - faint border. Use for the floating nav and feature/preview cards.
- `.glass-soft` — lighter frosting for secondary panels (e.g. the stat strip).

Rules:

- Glass needs something behind it to be worth it. Place it over a gradient, the
  dune contours, or scrolling content; on a flat fill it just looks gray.
- Approved surfaces: the **floating nav pill**, **preview/feature cards**, the
  **stat strip**, the **CTA panel**. Don't frost dense data tables or body text.
- Always pair with rounded corners (`rounded-2xl`/`rounded-3xl`) and a hairline.

---

## 5. Motion

Refined and subtle. Slow, confident settling on the signature easing
`--ease-dune` (`cubic-bezier(0.2, 0.7, 0.2, 1)`). **Everything respects
`prefers-reduced-motion`** — the hidden/animated states are gated to
`no-preference` in CSS, and JS components bail when reduce is set.

Primitives in `src/components/landing/`:

- **`<Reveal>`** — blur + fade + rise as content scrolls in (IntersectionObserver).
  Wrap headings, paragraphs, cards. Stagger siblings with `delayMs` (~120ms steps).
- **`<Parallax speed>`** — subtle vertical drift on scroll. Keep `speed` small
  (0.06–0.18); background/focal art only, never body text.
- **`<CountUp to>`** — tallies a number on view (used for the live stat).
- **`<LetterReveal>`** — reveals a headline letter by letter; used on the hero h1.
- **`DuneContours`** — the signature ambient motif: crisp topographic contour
  lines that drift slowly (CSS `contour-drift-a/-b`). Full-bleed behind the nav.

Rules:

- Motion is **garnish**: nothing essential should depend on it; content is fully
  usable static and under reduced-motion.
- Durations 0.6–0.9s for reveals, very slow (60–80s) for ambient loops. No bouncy
  or springy easing — this is calm, not playful.
- Don't animate more than a couple of things at once in view; stagger instead.

---

## 6. The signature graphic

`DuneContours` renders crisp topographic contour lines that drift slowly in two
interleaved directions, full-bleed behind the nav to the top of the page, over a
soft radial spice glow. It is the ambient backdrop. Color derives from `--spice`.

When a surface needs visual interest, reach for the contours, a soft radial spice
glow (`radial-gradient(... color-mix(in oklch, var(--spice) N%, transparent))`),
or generous emptiness. Don't add stock illustration or icons-in-circles.

---

## 7. Layout & components

- **Generous whitespace.** Sections breathe (`py-16`→`py-28`). Crowding kills the
  vibe faster than anything.
- **Feature sections** alternate a text column (eyebrow → serif title → body →
  inline bullet row) with a frosted preview card, flipping sides each row
  (Didit-style). See `FeatureRow` in `src/app/page.tsx`.
- **Lists flat by default.** Quiet rows, hairline dividers, content-first; offer a
  grid/card view as a toggle, not the default.
- **Containers**: `max-w-5xl`/`max-w-6xl`, `px-6`. Center hero copy in `max-w-4xl`.
- **Radius**: `rounded-2xl`/`rounded-3xl` for glass panels; keep small controls
  modest. Avoid the uniform mid-radius bordered-tile grid.
- Reuse the primitives in `src/components/ui/`; restyle via tokens rather than
  forking the stock look.

---

## 8. Accessibility (non-negotiable)

- Honor `prefers-reduced-motion` everywhere (already built into the primitives).
- Maintain contrast: ink on sand is fine; **spice on sand is decorative** — don't
  set long body copy in spice. Don't rely on the blur/opacity initial state for
  meaning.
- Decorative SVG/art is `aria-hidden`. Real labels on inputs, focus-visible rings
  preserved (tokens include them).
- Glass must keep text legible — if backdrop-blur is unsupported the fallback
  fill must still pass contrast.
