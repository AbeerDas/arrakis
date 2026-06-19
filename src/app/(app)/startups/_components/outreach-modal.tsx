"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { generateOutreachPrompt } from "@/app/(app)/outreach/actions";

type Status =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ready"; prompt: string; copied: boolean }
  | { kind: "needs-profile" }
  | { kind: "error" };

export function OutreachModal({
  companyId,
  companyName,
  onClose,
}: {
  companyId: string;
  companyName: string;
  onClose: () => void;
}) {
  const [jobPosting, setJobPosting] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [toast, setToast] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fireToast = useCallback(() => {
    setToast(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(false), 2200);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    [],
  );

  const build = async () => {
    setStatus({ kind: "loading" });
    try {
      const res = await generateOutreachPrompt(companyId, jobPosting, notes);
      if (!res.ok) {
        setStatus({
          kind: res.reason === "needs-profile" ? "needs-profile" : "error",
        });
        return;
      }
      let copied = false;
      try {
        await navigator.clipboard.writeText(res.prompt);
        copied = true;
      } catch {
        copied = false;
      }
      setStatus({ kind: "ready", prompt: res.prompt, copied });
      if (copied) fireToast();
    } catch {
      setStatus({ kind: "error" });
    }
  };

  const copyAgain = async () => {
    if (status.kind !== "ready") return;
    try {
      await navigator.clipboard.writeText(status.prompt);
      setStatus({ ...status, copied: true });
      fireToast();
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <button
        aria-label="Close"
        onClick={onClose}
        className="bg-foreground/30 absolute inset-0 backdrop-blur-[2px]"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Cold outreach for ${companyName}`}
        className="bg-background relative flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border shadow-xl"
      >
        <div className="flex items-start justify-between gap-3 border-b p-5">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              Cold outreach email
            </h2>
            <p className="text-muted-foreground mt-0.5 text-sm">
              {companyName}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {status.kind === "needs-profile" ? (
            <div className="rounded-lg border border-dashed p-4 text-sm">
              You need to save your resume first.{" "}
              <Link
                href="/outreach"
                className="text-spice underline-offset-4 hover:underline"
              >
                Set up outreach
              </Link>
              .
            </div>
          ) : null}

          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Job posting{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </label>
            <textarea
              value={jobPosting}
              onChange={(e) => setJobPosting(e.target.value)}
              rows={4}
              placeholder="Paste the role description, if you have one."
              className="border-input bg-background w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Extra notes{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Anything specific to mention for this one."
              className="border-input bg-background w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>

          {status.kind === "ready" ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Prompt</label>
                <span className="text-spice text-xs">
                  {status.copied ? "Copied to clipboard" : "Copy below"}
                </span>
              </div>
              <textarea
                readOnly
                value={status.prompt}
                rows={8}
                onFocus={(e) => e.currentTarget.select()}
                className="border-input bg-muted/40 w-full rounded-lg border px-3 py-2 font-mono text-xs"
              />
            </div>
          ) : null}

          {status.kind === "error" ? (
            <p className="text-destructive text-sm">
              Something went wrong. Try again.
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t p-5">
          <button
            onClick={build}
            disabled={status.kind === "loading"}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
          >
            {status.kind === "loading"
              ? "Building…"
              : status.kind === "ready"
                ? "Rebuild & copy"
                : "Build & copy prompt"}
          </button>
          {status.kind === "ready" ? (
            <button
              onClick={copyAgain}
              className="border-input hover:bg-accent rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors"
            >
              Copy again
            </button>
          ) : null}
          <a
            href="https://claude.ai/new"
            target="_blank"
            rel="noopener noreferrer"
            className="border-input hover:bg-accent ml-auto rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors"
          >
            Open Claude
          </a>
        </div>
      </div>

      {toast ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[80] flex justify-center px-4">
          <div className="bg-foreground text-background animate-in fade-in slide-in-from-bottom-2 flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium shadow-lg duration-200">
            <Check className="size-4" />
            Copied to clipboard
          </div>
        </div>
      ) : null}
    </div>
  );
}
