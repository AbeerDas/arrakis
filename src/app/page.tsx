import Link from "next/link";
import { LetterReveal } from "@/components/landing/letter-reveal";
import { Parallax } from "@/components/landing/parallax";
import { Reveal } from "@/components/landing/reveal";
import { DuneContours } from "@/components/landing/dune-contours";
import { SiteHeader } from "@/components/site-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  return (
    <div className="relative flex min-h-screen flex-col">
      {/* full-bleed dune contours, behind the nav all the way to the top */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[150vh] overflow-hidden"
      >
        <DuneContours />
        <div className="absolute inset-x-0 top-0 h-[150vh] bg-[radial-gradient(70%_55%_at_50%_0%,color-mix(in_oklch,var(--spice)_12%,transparent),transparent)]" />
      </div>

      <SiteHeader />

      <main className="flex-1">
        {/* ---------------------------------------------------------------- HERO */}
        <section className="mx-auto w-full max-w-4xl px-6 pt-36 pb-40 text-center sm:pt-44">
          <Reveal>
            <p className="text-spice text-xs font-medium tracking-[0.28em] uppercase">
              Move first · the rest follow
            </p>
          </Reveal>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl leading-[1.05] font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            <LetterReveal text="Find startups before they know they’re hiring." />
          </h1>
          <Reveal delayMs={700}>
            <p className="text-muted-foreground mx-auto mt-7 max-w-md text-lg leading-relaxed">
              See new companies the day they appear, and reach the right founder
              before the role is ever posted.
            </p>
          </Reveal>
          <Reveal delayMs={820}>
            <div className="mt-10 flex items-center justify-center gap-3">
              <Link
                href="/signup"
                className={cn(buttonVariants({ size: "lg" }), "rounded-xl")}
              >
                Get started
              </Link>
              <Link
                href="#how"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "rounded-xl",
                )}
              >
                See how it works
              </Link>
            </div>
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
              <p className="text-spice text-center text-xs font-medium tracking-[0.28em] uppercase">
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
            <div className="glass rounded-3xl px-8 py-20 text-center">
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
   Feature row — eyebrow + serif title + body + a frosted preview card,
   alternating sides. Rich header, kept lean (no bullet clutter).
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
        <p className="text-spice text-xs font-medium tracking-[0.24em] uppercase">
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
          <div className="glass rounded-2xl p-5 shadow-sm">{children}</div>
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
   Frosted preview mocks — intentionally flat and quiet (no heavy tile chrome).
--------------------------------------------------------------------------- */
function MockBar() {
  return (
    <div className="mb-3 flex items-center gap-1.5">
      <span className="bg-foreground/15 size-2.5 rounded-full" />
      <span className="bg-foreground/15 size-2.5 rounded-full" />
      <span className="bg-foreground/15 size-2.5 rounded-full" />
    </div>
  );
}

function DatabaseMock() {
  const rows = [
    { name: "Atreides Labs", tag: "W24 · AI" },
    { name: "Spice Logistics", tag: "S24 · Fintech" },
    { name: "Caladan Health", tag: "W24 · Bio" },
    { name: "Fremen Robotics", tag: "S24 · Hardware" },
  ];
  return (
    <div>
      <MockBar />
      <div className="bg-background/60 text-muted-foreground rounded-lg px-3 py-2 text-sm">
        Search · batch, industry, team size
      </div>
      <div className="divide-border/70 mt-2 divide-y">
        {rows.map((r) => (
          <div
            key={r.name}
            className="flex items-center justify-between py-2.5 text-sm"
          >
            <span className="text-foreground font-medium">{r.name}</span>
            <span className="text-muted-foreground text-xs">{r.tag}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmailMock() {
  return (
    <div>
      <MockBar />
      <p className="text-spice text-xs tracking-wider uppercase">Draft</p>
      <p className="text-foreground mt-2 text-sm font-medium">
        Subject: Loved what you&rsquo;re building at Caladan
      </p>
      <div className="text-muted-foreground mt-3 space-y-2 text-sm leading-relaxed">
        <p>Hi Rodrigo, I saw Caladan just launched out of W24.</p>
        <p>
          I&rsquo;ve shipped three 0→1 health features and would love to help
          you ship the next one.
        </p>
      </div>
      <div className="mt-4 flex gap-2">
        <span className="bg-primary text-primary-foreground rounded-lg px-3 py-1.5 text-xs">
          Send
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
    { name: "Atreides Labs", stage: "Got response", on: true },
    { name: "Spice Logistics", stage: "Applied", on: true },
    { name: "Caladan Health", stage: "Interview", on: true },
    { name: "Fremen Robotics", stage: "Drafting", on: false },
  ];
  return (
    <div>
      <MockBar />
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
      <MockBar />
      <div className="flex items-center gap-3">
        <span className="bg-foreground/10 flex size-11 items-center justify-center rounded-full font-serif text-lg">
          RL
        </span>
        <div>
          <p className="text-foreground text-sm font-medium">Rodrigo Ley</p>
          <p className="text-muted-foreground text-xs">Founder &amp; CEO</p>
        </div>
      </div>
      <div className="bg-background/50 mt-4 flex items-center justify-between rounded-lg px-3 py-2.5">
        <span className="text-muted-foreground text-sm tracking-wide blur-[5px] select-none">
          rodrigo@caladan.health
        </span>
        <span className="bg-primary text-primary-foreground rounded-lg px-3 py-1.5 text-xs">
          Unlock
        </span>
      </div>
    </div>
  );
}
