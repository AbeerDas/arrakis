"use client";

import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";
import type { StartupRow } from "@/lib/startups";
import { cn } from "@/lib/utils";
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

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(onClose, 300);
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

  return (
    <div className="fixed inset-0 z-[60]">
      <button
        aria-label="Close"
        onClick={handleClose}
        className={cn(
          "bg-foreground/20 absolute inset-0 backdrop-blur-[2px] transition-opacity duration-300",
          visible ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={s.name}
        className={cn(
          "bg-background absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l shadow-xl transition-transform duration-300",
          visible ? "translate-x-0" : "translate-x-full",
        )}
        style={{ transitionTimingFunction: "var(--ease-dune)" }}
      >
        <div className="flex items-start justify-between gap-3 border-b p-5">
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
              {s.isNew ? (
                <span className="text-spice text-xs font-medium">New</span>
              ) : null}
            </div>
          </div>
          <button
            onClick={handleClose}
            aria-label="Close"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-5">
          {s.oneLiner ? <p className="text-sm">{s.oneLiner}</p> : null}

          <dl className="grid grid-cols-2 gap-4">
            {facts
              .filter((f): f is { label: string; value: string } =>
                Boolean(f.value),
              )
              .map((f) => (
                <Field key={f.label} label={f.label} value={f.value} />
              ))}
          </dl>

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

        <div className="space-y-2 border-t p-5">
          <button
            onClick={() => setOutreachOpen(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 w-full rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
          >
            Cold outreach email
          </button>
          {s.website || s.ycUrl ? (
            <div className="flex gap-2">
              {s.website ? (
                <a
                  href={s.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-input hover:bg-accent flex-1 rounded-xl border px-4 py-2.5 text-center text-sm font-medium transition-colors"
                >
                  Visit site
                </a>
              ) : null}
              {s.ycUrl ? (
                <a
                  href={s.ycUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "border-input hover:bg-accent rounded-xl border px-4 py-2.5 text-center text-sm font-medium transition-colors",
                    s.website ? "" : "flex-1",
                  )}
                >
                  View on YC
                </a>
              ) : null}
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
