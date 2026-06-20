"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, ExternalLink, Mail, Plus, X } from "lucide-react";
import { addToTracker } from "@/app/(app)/tracker/actions";
import type { StartupRow } from "@/lib/startups";
import type { StartupSignals } from "@/lib/signals/types";
import { cn } from "@/lib/utils";
import { getStartupSignals } from "../actions";
import { SignalsPanel } from "./signals-ui";
import { OutreachModal } from "./outreach-modal";

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted-foreground text-xs tracking-wide uppercase">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm">{value}</dd>
    </div>
  );
}

export function StartupDetail({
  startup,
  onClose,
}: {
  startup: StartupRow;
  onClose: () => void;
}) {
  const [visible, setVisible] = useState(false);
  const [outreachOpen, setOutreachOpen] = useState(false);
  const [trackState, setTrackState] = useState<"idle" | "saving" | "done">(
    "idle",
  );
  // Seed from the cached signals already on the row, then refresh on open.
  const [signals, setSignals] = useState<StartupSignals>(startup.signals);
  const [signalsLoading, setSignalsLoading] = useState(true);

  // The modal is keyed by startup id (see the explorer), so this runs once per
  // open with the right cached seed; no synchronous loading reset needed.
  useEffect(() => {
    let active = true;
    getStartupSignals(startup.id)
      .then((s) => {
        if (active) setSignals(s);
      })
      .finally(() => {
        if (active) setSignalsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [startup.id]);

  const handleTrack = async () => {
    if (trackState !== "idle") return;
    setTrackState("saving");
    await addToTracker(startup.id);
    setTrackState("done");
  };

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(onClose, 200);
  }, [onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !outreachOpen) handleClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [handleClose, outreachOpen]);

  const s = startup;
  const facts: { label: string; value: string | null }[] = [
    { label: "Batch", value: s.batch },
    { label: "Stage", value: s.stage },
    { label: "Status", value: s.status },
    { label: "Industry", value: s.subindustry || s.industry },
    {
      label: "Team size",
      value: typeof s.teamSize === "number" ? String(s.teamSize) : null,
    },
    { label: "Location", value: s.location },
  ];
  const shownFacts = facts.filter((f): f is { label: string; value: string } =>
    Boolean(f.value),
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto p-4 sm:p-6">
      <button
        aria-label="Close"
        onClick={handleClose}
        className={cn(
          "bg-foreground/20 fixed inset-0 backdrop-blur-[2px] transition-opacity duration-200",
          visible ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={s.name}
        className={cn(
          "bg-background relative my-auto flex max-h-[88vh] w-full max-w-2xl flex-col rounded-2xl border shadow-xl transition-all duration-200",
          visible ? "scale-100 opacity-100" : "scale-[0.98] opacity-0",
        )}
        style={{ transitionTimingFunction: "var(--ease-dune)" }}
      >
        {/* header + actions stay pinned; only the body scrolls */}
        <div className="border-b p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              {s.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={s.logoUrl}
                  alt=""
                  className="border-border/60 bg-card size-11 shrink-0 rounded-md border object-contain p-1"
                  loading="lazy"
                />
              ) : (
                <span className="bg-foreground/10 flex size-11 shrink-0 items-center justify-center rounded-md text-sm font-medium">
                  {s.name.charAt(0)}
                </span>
              )}
              <div className="min-w-0">
                <h2 className="truncate text-xl font-semibold tracking-tight">
                  {s.name}
                </h2>
                {s.oneLiner ? (
                  <p className="text-muted-foreground truncate text-sm">
                    {s.oneLiner}
                  </p>
                ) : s.isNew ? (
                  <span className="text-spice text-xs font-medium">New</span>
                ) : null}
              </div>
            </div>
            <button
              onClick={handleClose}
              aria-label="Close"
              className="text-muted-foreground hover:text-foreground -m-1 shrink-0 p-1 transition-colors"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              onClick={() => setOutreachOpen(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors"
            >
              <Mail className="size-4" /> Cold outreach email
            </button>
            <button
              onClick={handleTrack}
              disabled={trackState !== "idle"}
              className="border-input hover:bg-accent inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-sm font-medium transition-colors disabled:opacity-70"
            >
              {trackState === "done" ? (
                <>
                  <Check className="size-4" /> Added
                </>
              ) : (
                <>
                  <Plus className="size-4" />{" "}
                  {trackState === "saving" ? "Adding…" : "Add to tracker"}
                </>
              )}
            </button>
            {s.website ? (
              <a
                href={s.website}
                target="_blank"
                rel="noopener noreferrer"
                className="border-input hover:bg-accent inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-sm font-medium transition-colors"
              >
                <ExternalLink className="size-4" /> Site
              </a>
            ) : null}
            {s.ycUrl ? (
              <a
                href={s.ycUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="border-input hover:bg-accent inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-sm font-medium transition-colors"
              >
                View on YC
              </a>
            ) : null}
          </div>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-5">
          {shownFacts.length > 0 ? (
            <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {shownFacts.map((f) => (
                <Field key={f.label} label={f.label} value={f.value} />
              ))}
            </dl>
          ) : null}

          <SignalsPanel signals={signals} loading={signalsLoading} />

          {s.description ? (
            <div>
              <h3 className="text-muted-foreground text-xs tracking-wide uppercase">
                About
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed whitespace-pre-line">
                {s.description}
              </p>
            </div>
          ) : null}

          {s.founderNames.length > 0 ? (
            <div>
              <h3 className="text-muted-foreground text-xs tracking-wide uppercase">
                Founders
              </h3>
              <p className="mt-1.5 text-sm">{s.founderNames.join(", ")}</p>
            </div>
          ) : null}

          {s.tags.length > 0 ? (
            <div>
              <h3 className="text-muted-foreground text-xs tracking-wide uppercase">
                Tags
              </h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {s.tags.map((t) => (
                  <span
                    key={t}
                    className="border-border/70 text-muted-foreground rounded-full border px-2 py-0.5 text-xs"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {outreachOpen ? (
        <OutreachModal
          companyId={s.id}
          companyName={s.name}
          onClose={() => setOutreachOpen(false)}
        />
      ) : null}
    </div>
  );
}
