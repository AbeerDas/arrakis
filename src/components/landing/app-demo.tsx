"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Hero app demo — a Mac-style window showing the core loop: the startups list
 * on the left, a personalized cold email on the right. Clicking a startup row
 * swaps the email shown (the one functional bit; data is illustrative).
 */
type Company = {
  name: string;
  tag: string;
  to: string;
  subject: string;
  greeting: string;
  body: string;
};

const COMPANIES: Company[] = [
  {
    name: "Caladan Health",
    tag: "W24",
    to: "rodrigo@caladan",
    subject: "Saw Caladan just shipped real-time triage",
    greeting: "Hi Rodrigo,",
    body: "Saw Caladan shipped real-time triage out of W24. The latency angle is the hard part, and it's exactly what I was deep in shipping 0 to 1 health features last year.",
  },
  {
    name: "Atreides Labs",
    tag: "W24",
    to: "jess@atreides",
    subject: "Your agent eval harness caught my eye",
    greeting: "Hi Jess,",
    body: "The eval harness you open-sourced is the cleanest take on agent reliability I've seen. I spent last year making agent systems not silently fail in prod.",
  },
  {
    name: "Spice Logistics",
    tag: "S24",
    to: "amir@spice",
    subject: "EDI is wild, and exactly the right problem",
    greeting: "Hi Amir,",
    body: "It's genuinely wild the physical economy still runs on EDI built by hand. That's the kind of grind I like, I shipped freight tooling at BorderPass last year.",
  },
  {
    name: "Fremen Robotics",
    tag: "S24",
    to: "lena@fremen",
    subject: "Your warehouse arm demo was unreal",
    greeting: "Hi Lena,",
    body: "The warehouse-arm demo from S24 was unreal, the recovery-from-failure bit especially. I built self-healing agent pipelines that win on exactly that.",
  },
  {
    name: "Arrakis Data",
    tag: "W24",
    to: "sam@arrakis",
    subject: "Turning founder data into outreach, love it",
    greeting: "Hi Sam,",
    body: "Turning raw founder data into something you can act on is a great wedge. I've shipped data-heavy product UI fast and would love to help.",
  },
];

export function AppDemo() {
  const [selected, setSelected] = useState(0);
  const c = COMPANIES[selected];

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
        {/* left: startups list (rows are clickable) */}
        <div className="border-border/60 border-b p-4 sm:border-r sm:border-b-0">
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-semibold">Startups</span>
            <span className="text-muted-foreground text-xs">5,960</span>
          </div>
          <div className="bg-muted/70 text-muted-foreground mt-3 rounded-lg px-3 py-1.5 text-xs">
            Search name, batch, industry
          </div>
          <div className="mt-2 space-y-0.5">
            {COMPANIES.map((r, i) => (
              <button
                key={r.name}
                type="button"
                onClick={() => setSelected(i)}
                aria-pressed={i === selected}
                className={cn(
                  "flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors",
                  i === selected ? "bg-accent" : "hover:bg-accent/50",
                )}
              >
                <span className="bg-foreground/10 flex size-7 shrink-0 items-center justify-center rounded-md text-xs font-medium">
                  {r.name.charAt(0)}
                </span>
                <span className="flex-1 truncate text-sm font-medium">
                  {r.name}
                </span>
                <span className="text-muted-foreground text-xs">{r.tag}</span>
              </button>
            ))}
          </div>
        </div>

        {/* right: cold outreach composer (swaps with the selected company) */}
        <div className="p-5">
          <p className="text-spice text-xs font-bold tracking-wider uppercase">
            Cold outreach · {c.name}
          </p>
          <div
            key={selected}
            className="animate-in fade-in slide-in-from-bottom-1 duration-300"
          >
            <p className="text-foreground mt-2.5 text-sm font-medium">
              Subject: {c.subject}
            </p>
            <div className="text-muted-foreground mt-3 space-y-2 text-sm leading-relaxed">
              <p>{c.greeting}</p>
              <p>{c.body}</p>
              <p>
                Portfolio: <span className="text-spice">abeerkdas.me</span>.
                Resume attached.
              </p>
            </div>
          </div>
          <div className="mt-5 flex items-center gap-2">
            <button
              type="button"
              className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap shadow-sm transition-colors"
            >
              Copy email
            </button>
            <button
              type="button"
              className="border-border text-muted-foreground hover:bg-accent cursor-pointer rounded-lg border px-3 py-1.5 text-xs whitespace-nowrap transition-colors"
            >
              Regenerate
            </button>
            <span className="text-muted-foreground ml-auto hidden text-xs whitespace-nowrap lg:inline">
              Personalized from your resume
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
