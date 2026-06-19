import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LetterReveal } from "@/components/landing/letter-reveal";
import { Parallax } from "@/components/landing/parallax";
import { Reveal } from "@/components/landing/reveal";
import { SiteHeader } from "@/components/site-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  return (
    <div className="relative flex min-h-screen flex-col">
      {/* full-bleed desert scenery, faded into the soft white, behind the hero */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[135vh] overflow-hidden"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/desert.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-[center_68%] opacity-[0.36]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,var(--background)_0%,transparent_38%,transparent_62%,var(--background)_90%)]" />
        <div className="absolute inset-x-0 top-0 h-[135vh] bg-[radial-gradient(55%_40%_at_50%_6%,color-mix(in_oklch,var(--spice)_8%,transparent),transparent)]" />
      </div>

      <SiteHeader />

      <main className="flex-1">
        {/* ---------------------------------------------------------------- HERO */}
        <section className="mx-auto w-full max-w-6xl overflow-hidden px-6 pt-32 pb-0 text-center sm:pt-40">
          <Reveal>
            <p className="text-spice text-xs font-bold tracking-[0.28em] uppercase">
              Move first · the rest follow
            </p>
          </Reveal>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl leading-[1.05] font-extrabold tracking-tight text-balance sm:text-5xl md:text-6xl">
            <LetterReveal text="Find startups before they know they’re hiring." />
          </h1>
          <Reveal delayMs={700}>
            <p className="text-muted-foreground mx-auto mt-7 max-w-md text-lg leading-relaxed">
              See new companies the day they appear, and reach the right founder
              before the role is ever posted.
            </p>
          </Reveal>
          <Reveal delayMs={820}>
            <div className="mt-10 flex items-center justify-center gap-6">
              <Link
                href="/signup"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "shadow-foreground/25 rounded-xl shadow-lg transition-shadow hover:shadow-xl",
                )}
              >
                Get started
              </Link>
              <Link
                href="#how"
                className="group text-foreground inline-flex items-center gap-1.5 text-sm font-medium"
              >
                See how it works
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </Reveal>

          {/* post-MVP app demo, peeking up from the bottom of the hero */}
          <Reveal delayMs={940}>
            <Parallax speed={0.04}>
              <div className="relative mx-auto mt-36 max-w-5xl">
                <AppDemo />
                {/* fade the bottom edge so it dissolves into the page */}
                <div className="from-background pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t to-transparent" />
              </div>
            </Parallax>
          </Reveal>
        </section>

        {/* ------------------------------------------------------------- FEATURES */}
        <section className="mx-auto w-full max-w-6xl space-y-48 px-6 py-24">
          <FeatureRow
            eyebrow="Discover"
            title="Every early-stage startup, the day it appears."
            body="Browse a clean, nightly-refreshed list and filter to exactly what fits."
          >
            <DatabaseMock />
          </FeatureRow>

          <FeatureRow
            reverse
            eyebrow="Outreach"
            title="A sharp cold email, tuned to each founder."
            body="Feed in your resume and a role. Get a specific email per company that learns your voice as you edit."
          >
            <EmailMock />
          </FeatureRow>

          <FeatureRow
            eyebrow="Track"
            title="Every application, in one private pipeline."
            body="Your own stages, notes, and the email you sent on each row. Yours alone, never shared."
          >
            <TrackerMock />
          </FeatureRow>

          <FeatureRow
            reverse
            eyebrow="Unlock"
            title="Founder contacts, personally verified."
            body="Reach decision-makers with hand-verified founder emails. Unlock the full set once, no subscription."
          >
            <ContactMock />
          </FeatureRow>
        </section>

        {/* --------------------------------------------------------- HOW IT WORKS */}
        <section id="how" className="py-32">
          <div className="mx-auto w-full max-w-5xl px-6">
            <Reveal>
              <p className="text-spice text-center text-xs font-bold tracking-[0.28em] uppercase">
                How it works
              </p>
              <h2 className="mx-auto mt-4 max-w-2xl text-center text-4xl font-bold tracking-tight sm:text-5xl">
                Discover. Reach. Track.
              </h2>
            </Reveal>
            <div className="mt-20 grid gap-12 sm:grid-cols-3">
              {STEPS.map((step, i) => (
                <Reveal key={step.title} delayMs={i * 140}>
                  <div className="flex flex-col">
                    <span className="text-spice/70 text-5xl font-black tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-4 text-2xl font-bold tracking-tight">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                      {step.body}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* -------------------------------------------------------------- CTA */}
        <section className="mx-auto w-full max-w-5xl px-6 py-32">
          <Reveal>
            <div className="glass relative overflow-hidden rounded-3xl px-8 py-20 text-center">
              {/* the same dunes, rising from the bottom and fading out upward */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/desert.jpg"
                alt=""
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-4/5 w-full [mask-image:linear-gradient(to_top,black,transparent)] object-cover object-bottom opacity-[0.3]"
              />
              <div className="relative">
                <h2 className="mx-auto max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
                  Be the first name in the inbox.
                </h2>
                <p className="text-muted-foreground mx-auto mt-5 max-w-lg">
                  Start free. Find the companies, reach the founders, keep every
                  thread in one place.
                </p>
                <Link
                  href="/signup"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "mt-9 rounded-xl",
                  )}
                >
                  Get started
                </Link>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="border-t">
        <div className="text-muted-foreground mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-8 text-sm">
          <span className="text-foreground text-base font-semibold tracking-tight">
            Arrakis
          </span>
          <div className="flex items-center gap-6">
            <Link
              href="/blog"
              className="hover:text-foreground underline-offset-4 hover:underline"
            >
              Blog
            </Link>
            <Link
              href="/login"
              className="hover:text-foreground underline-offset-4 hover:underline"
            >
              Log in
            </Link>
            <span>© 2026 Arrakis</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Feature row — eyebrow + title + body + a frosted preview card, alternating
   sides. The card lifts on hover. Rich header, kept lean (no bullet clutter).
--------------------------------------------------------------------------- */
function FeatureRow({
  eyebrow,
  title,
  body,
  reverse,
  children,
}: {
  eyebrow: string;
  title: string;
  body: string;
  reverse?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="grid items-center gap-10 md:grid-cols-2 md:gap-20">
      <Reveal className={cn(reverse && "md:order-2")}>
        <p className="text-spice text-xs font-bold tracking-[0.24em] uppercase">
          {eyebrow}
        </p>
        <h2 className="mt-4 text-3xl leading-tight font-bold tracking-tight sm:text-4xl">
          {title}
        </h2>
        <p className="text-muted-foreground mt-4 max-w-md leading-relaxed">
          {body}
        </p>
      </Reveal>
      <Reveal className={cn(reverse && "md:order-1")} delayMs={120}>
        <Parallax speed={0.06}>
          <div className="glass rounded-2xl p-5 shadow-sm transition-[transform,box-shadow] duration-500 [transition-timing-function:var(--ease-dune)] hover:-translate-y-1.5 hover:shadow-xl">
            {children}
          </div>
        </Parallax>
      </Reveal>
    </div>
  );
}

const STEPS = [
  {
    title: "Discover",
    body: "Scan companies added since your last visit, filtered to the roles and stages you care about.",
  },
  {
    title: "Reach",
    body: "Generate a resume-backed email tuned to the founder, edit it to your voice, and send.",
  },
  {
    title: "Track",
    body: "Drop the company into your private pipeline and keep the thread and notes in one place.",
  },
];

/* ---------------------------------------------------------------------------
   Hero app demo — a Mac-style window showing the core loop: the startups list
   on the left, a personalized cold email composed on the right.
--------------------------------------------------------------------------- */
function AppDemo() {
  const rows = [
    { name: "Caladan Health", tag: "W24", selected: true },
    { name: "Atreides Labs", tag: "W24" },
    { name: "Spice Logistics", tag: "S24" },
    { name: "Fremen Robotics", tag: "S24" },
    { name: "Arrakis Data", tag: "W24" },
  ];
  return (
    <div className="bg-card border-border/70 shadow-foreground/10 overflow-hidden rounded-2xl border text-left shadow-2xl">
      {/* window chrome */}
      <div className="border-border/60 bg-background/60 flex items-center gap-2 border-b px-4 py-3">
        <span className="size-3 rounded-full bg-[#ff5f57]" />
        <span className="size-3 rounded-full bg-[#febc2e]" />
        <span className="size-3 rounded-full bg-[#28c840]" />
        <span className="text-muted-foreground ml-3 text-xs font-medium">
          Arrakis
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_1.35fr]">
        {/* left: startups list */}
        <div className="border-border/60 border-b p-4 sm:border-r sm:border-b-0">
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-semibold">Startups</span>
            <span className="text-muted-foreground text-xs">5,960</span>
          </div>
          <div className="bg-muted/70 text-muted-foreground mt-3 rounded-lg px-3 py-1.5 text-xs">
            Search name, batch, industry
          </div>
          <div className="mt-2 space-y-0.5">
            {rows.map((r) => (
              <div
                key={r.name}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-2 py-2",
                  r.selected && "bg-accent",
                )}
              >
                <span className="bg-foreground/10 flex size-7 shrink-0 items-center justify-center rounded-md text-xs font-medium">
                  {r.name.charAt(0)}
                </span>
                <span className="flex-1 truncate text-sm font-medium">
                  {r.name}
                </span>
                <span className="text-muted-foreground text-xs">{r.tag}</span>
              </div>
            ))}
          </div>
        </div>

        {/* right: cold outreach composer */}
        <div className="p-5">
          <p className="text-spice text-xs font-bold tracking-wider uppercase">
            Cold outreach · Caladan Health
          </p>
          <p className="text-foreground mt-2.5 text-sm font-medium">
            Subject: Saw Caladan just shipped real-time triage
          </p>
          <div className="text-muted-foreground mt-3 space-y-2 text-sm leading-relaxed">
            <p>Hi Rodrigo,</p>
            <p>
              Saw Caladan shipped real-time triage out of W24. The latency angle
              is the hard part, and it is exactly what I was deep in shipping 0
              to 1 health features last year.
            </p>
            <p>
              Portfolio: <span className="text-spice">abeerkdas.me</span>.
              Resume attached.
            </p>
          </div>
          <div className="mt-5 flex items-center gap-2">
            <span className="bg-primary text-primary-foreground rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap shadow-sm">
              Copy email
            </span>
            <span className="border-border text-muted-foreground rounded-lg border px-3 py-1.5 text-xs whitespace-nowrap">
              Regenerate
            </span>
            <span className="text-muted-foreground ml-auto hidden text-xs whitespace-nowrap lg:inline">
              Personalized from your resume
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Frosted preview mocks — each a distinct little surface with one quiet ambient
   loop (gated to no-preference in globals.css). Not identical rectangles.
--------------------------------------------------------------------------- */
function DatabaseMock() {
  const rows = [
    { name: "Atreides Labs", tag: "W24 · AI", fresh: true },
    { name: "Spice Logistics", tag: "S24 · Fintech" },
    { name: "Caladan Health", tag: "W24 · Bio" },
    { name: "Fremen Robotics", tag: "S24 · Hardware" },
  ];
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="anim-pulse-dot bg-spice size-2 rounded-full" />
          <span className="text-foreground text-xs font-semibold">
            New today
          </span>
        </div>
        <span className="text-muted-foreground text-xs">live feed</span>
      </div>
      <div className="bg-background/60 text-muted-foreground flex items-center rounded-lg px-3 py-2 text-sm">
        Search batch, industry, team size
        <span className="anim-caret bg-foreground/60 ml-0.5 inline-block h-4 w-px" />
      </div>
      <div className="divide-border/70 mt-2 divide-y">
        {rows.map((r) => (
          <div
            key={r.name}
            className={cn(
              "flex items-center justify-between py-2.5 text-sm",
              r.fresh && "bg-spice/5 -mx-2 rounded-md px-2",
            )}
          >
            <span className="text-foreground font-medium">{r.name}</span>
            {r.fresh ? (
              <span className="anim-pill text-spice text-[10px] font-bold tracking-wide uppercase">
                New
              </span>
            ) : (
              <span className="text-muted-foreground text-xs">{r.tag}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function EmailMock() {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-spice text-xs font-bold tracking-wider uppercase">
          Drafting
        </span>
        <span className="text-muted-foreground text-xs">
          to: rodrigo@caladan
        </span>
      </div>
      <p className="text-foreground text-sm font-medium">
        Subject: Saw Caladan just shipped real-time triage
      </p>
      <div className="text-muted-foreground mt-3 space-y-2 text-sm leading-relaxed">
        <p>Hi Rodrigo, saw Caladan launched out of W24.</p>
        <p>
          I shipped three 0→1 health features last year and would love to help
          you ship the next one.
          <span className="anim-caret bg-foreground/70 ml-0.5 inline-block h-4 w-px align-text-bottom" />
        </p>
      </div>
      <div className="mt-4 flex gap-2">
        <span className="anim-glow bg-primary text-primary-foreground rounded-lg px-3 py-1.5 text-xs font-medium">
          Copy email
        </span>
        <span className="border-border text-muted-foreground rounded-lg border px-3 py-1.5 text-xs">
          Regenerate
        </span>
      </div>
    </div>
  );
}

function TrackerMock() {
  const rows = [
    { name: "Atreides Labs", stage: "Got response", on: true, live: true },
    { name: "Spice Logistics", stage: "Applied", on: true },
    { name: "Caladan Health", stage: "Interview", on: true },
    { name: "Fremen Robotics", stage: "Drafting", on: false },
  ];
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-foreground text-xs font-semibold">Pipeline</span>
        <span className="text-muted-foreground text-xs">4 active</span>
      </div>
      <div className="space-y-1.5">
        {rows.map((r) => (
          <div
            key={r.name}
            className="bg-background/50 flex items-center justify-between rounded-lg px-3 py-2.5 text-sm"
          >
            <span className="text-foreground font-medium">{r.name}</span>
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-xs",
                r.live && "anim-glow",
                r.on
                  ? "bg-spice/15 text-spice"
                  : "bg-foreground/5 text-muted-foreground",
              )}
            >
              {r.stage}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContactMock() {
  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="bg-foreground/10 flex size-11 items-center justify-center rounded-full text-lg font-semibold">
          RL
        </span>
        <div>
          <p className="text-foreground text-sm font-medium">Rodrigo Ley</p>
          <p className="text-muted-foreground text-xs">Founder &amp; CEO</p>
        </div>
      </div>
      <div className="bg-background/50 mt-4 flex items-center justify-between gap-3 rounded-lg px-3 py-2.5">
        <span className="anim-tease text-muted-foreground truncate text-sm tracking-wide select-none">
          rodrigo@caladan.health
        </span>
        <span className="anim-glow bg-primary text-primary-foreground shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium">
          Unlock
        </span>
      </div>
    </div>
  );
}
