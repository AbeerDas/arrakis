"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Plus, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TrackerEntryRow, TrackerStageRow } from "@/lib/tracker";
import {
  addCustomStage,
  addToTracker,
  removeCustomStage,
  removeFromTracker,
  searchStartupsToAdd,
  setStage,
  updateNotes,
  updateSentEmail,
} from "../actions";

type Found = { id: string; name: string; batch: string | null };

export function TrackerBoard({
  entries: initialEntries,
  stages: initialStages,
}: {
  entries: TrackerEntryRow[];
  stages: TrackerStageRow[];
}) {
  const [entries, setEntries] = useState(initialEntries);
  const [stages, setStages] = useState(initialStages);
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggleStage = (entryId: string, stageId: string) => {
    const entry = entries.find((e) => e.id === entryId);
    if (!entry) return;
    const checked = !entry.stageIds.includes(stageId);
    setEntries((prev) =>
      prev.map((e) =>
        e.id === entryId
          ? {
              ...e,
              stageIds: checked
                ? [...e.stageIds, stageId]
                : e.stageIds.filter((s) => s !== stageId),
            }
          : e,
      ),
    );
    void setStage(entryId, stageId, checked);
  };

  const handleAdd = async (startupId: string) => {
    const res = await addToTracker(startupId);
    if (res.ok) setEntries((prev) => [res.entry, ...prev]);
  };

  const handleRemove = (entryId: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== entryId));
    void removeFromTracker(entryId);
  };

  const handleAddStage = async (label: string): Promise<string | null> => {
    const res = await addCustomStage(label);
    if (!res.ok) return res.message;
    setStages((prev) => [...prev, res.stage]);
    return null;
  };

  const handleRemoveStage = (stageId: string) => {
    setStages((prev) => prev.filter((s) => s.id !== stageId));
    setEntries((prev) =>
      prev.map((e) => ({
        ...e,
        stageIds: e.stageIds.filter((s) => s !== stageId),
      })),
    );
    void removeCustomStage(stageId);
  };

  return (
    <div className="mt-6 space-y-5">
      <AddStartup onAdd={handleAdd} />
      <StageManager
        stages={stages}
        onAdd={handleAddStage}
        onRemove={handleRemoveStage}
      />

      {entries.length === 0 ? (
        <div className="text-muted-foreground rounded-xl border border-dashed p-10 text-center text-sm">
          No startups tracked yet. Search above to add one, or use the mail or
          add button on any startup.
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              stages={stages}
              expanded={expanded === entry.id}
              onToggleExpand={() =>
                setExpanded((cur) => (cur === entry.id ? null : entry.id))
              }
              onToggleStage={(stageId) => toggleStage(entry.id, stageId)}
              onRemove={() => handleRemove(entry.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function EntryCard({
  entry,
  stages,
  expanded,
  onToggleExpand,
  onToggleStage,
  onRemove,
}: {
  entry: TrackerEntryRow;
  stages: TrackerStageRow[];
  expanded: boolean;
  onToggleExpand: () => void;
  onToggleStage: (stageId: string) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-xl border">
      <div className="flex flex-wrap items-center gap-3 p-3">
        {entry.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={entry.logoUrl}
            alt=""
            className="border-border/60 bg-card size-9 shrink-0 rounded-md border object-contain p-1"
            loading="lazy"
          />
        ) : (
          <span className="bg-foreground/10 flex size-9 shrink-0 items-center justify-center rounded-md text-sm font-medium">
            {entry.name.charAt(0)}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-medium">{entry.name}</span>
            {entry.batch ? (
              <span className="text-muted-foreground text-xs">
                {entry.batch}
              </span>
            ) : null}
          </div>
          {entry.oneLiner ? (
            <p className="text-muted-foreground truncate text-sm">
              {entry.oneLiner}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {stages.map((s) => {
            const on = entry.stageIds.includes(s.id);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onToggleStage(s.id)}
                aria-pressed={on}
                className={cn(
                  "flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors",
                  on
                    ? "border-spice bg-spice/15 text-spice"
                    : "border-input text-muted-foreground hover:bg-accent",
                )}
              >
                {on ? <Check className="size-3" /> : null}
                {s.label}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onToggleExpand}
          className="text-muted-foreground hover:text-foreground ml-1 text-xs underline-offset-4 hover:underline"
        >
          {expanded ? "Hide" : "Notes & email"}
        </button>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${entry.name} from tracker`}
          className="text-muted-foreground hover:text-destructive transition-colors"
        >
          <X className="size-4" />
        </button>
      </div>

      {expanded ? (
        <div className="border-t p-3 sm:grid sm:grid-cols-2 sm:gap-4">
          <AutosaveField
            label="Notes"
            placeholder="Private notes for this startup."
            initial={entry.notes ?? ""}
            onSave={(v) => updateNotes(entry.id, v)}
          />
          <AutosaveField
            label="Email you sent"
            placeholder="Paste the email you sent, for your own records."
            initial={entry.sentEmailBody ?? ""}
            onSave={(v) => updateSentEmail(entry.id, v)}
            className="mt-3 sm:mt-0"
          />
        </div>
      ) : null}
    </div>
  );
}

/** Textarea that autosaves ~700ms after typing stops, with a Saving/Saved tag. */
function AutosaveField({
  label,
  placeholder,
  initial,
  onSave,
  className,
}: {
  label: string;
  placeholder: string;
  initial: string;
  onSave: (value: string) => Promise<void>;
  className?: string;
}) {
  const [value, setValue] = useState(initial);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedValue = useRef(initial);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const onChange = (next: string) => {
    setValue(next);
    setStatus("idle");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      if (next === savedValue.current) return;
      setStatus("saving");
      await onSave(next);
      savedValue.current = next;
      setStatus("saved");
    }, 700);
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between">
        <label className="text-muted-foreground text-xs font-medium">
          {label}
        </label>
        {status === "saving" ? (
          <span className="text-muted-foreground text-xs">Saving…</span>
        ) : status === "saved" ? (
          <span className="text-spice flex items-center gap-1 text-xs">
            <Check className="size-3" /> Saved
          </span>
        ) : null}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        placeholder={placeholder}
        className="border-input bg-background w-full resize-none rounded-lg border px-3 py-2 text-sm"
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function AddStartup({ onAdd }: { onAdd: (startupId: string) => void }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Found[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const reqRef = useRef(0);

  useEffect(() => {
    const clean = q.trim();
    if (clean.length < 2) return;
    const id = ++reqRef.current;
    const t = setTimeout(async () => {
      const rows = await searchStartupsToAdd(clean);
      if (id === reqRef.current) {
        setResults(rows);
        setOpen(true);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  return (
    <div ref={ref} className="relative max-w-md">
      <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => results.length && setOpen(true)}
        placeholder="Add a startup to your tracker"
        className="border-input bg-background focus-visible:ring-ring h-9 w-full rounded-lg border pr-3 pl-9 text-sm focus-visible:ring-2 focus-visible:outline-none"
      />
      {open && q.trim().length >= 2 && results.length > 0 ? (
        <div className="bg-popover text-popover-foreground absolute left-0 z-30 mt-1.5 w-full overflow-hidden rounded-xl border shadow-lg">
          {results.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => {
                onAdd(r.id);
                setQ("");
                setResults([]);
                setOpen(false);
              }}
              className="hover:bg-accent flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm"
            >
              <span className="truncate">{r.name}</span>
              <span className="text-muted-foreground flex items-center gap-2 text-xs">
                {r.batch ?? ""}
                <Plus className="size-3.5" />
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function StageManager({
  stages,
  onAdd,
  onRemove,
}: {
  stages: TrackerStageRow[];
  onAdd: (label: string) => Promise<string | null>;
  onRemove: (stageId: string) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    const message = await onAdd(label);
    if (message) {
      setError(message);
      return;
    }
    setLabel("");
    setError(null);
    setAdding(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 text-xs">
      <span className="text-muted-foreground mr-1">Stages:</span>
      {stages.map((s) => (
        <span
          key={s.id}
          className="border-border bg-secondary/50 flex items-center gap-1 rounded-full border px-2.5 py-1"
        >
          {s.label}
          {!s.isDefault ? (
            <button
              type="button"
              onClick={() => onRemove(s.id)}
              aria-label={`Delete ${s.label} stage`}
              className="text-muted-foreground hover:text-destructive"
            >
              <X className="size-3" />
            </button>
          ) : null}
        </span>
      ))}

      {adding ? (
        <span className="flex items-center gap-1">
          <input
            value={label}
            autoFocus
            onChange={(e) => {
              setLabel(e.target.value);
              setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") void submit();
              if (e.key === "Escape") {
                setAdding(false);
                setError(null);
              }
            }}
            placeholder="New stage"
            className="border-input bg-background h-7 w-28 rounded-full border px-2.5 text-xs focus-visible:outline-none"
          />
          <button
            type="button"
            onClick={() => void submit()}
            className="text-spice font-medium"
          >
            Add
          </button>
          {error ? <span className="text-destructive">{error}</span> : null}
        </span>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="text-muted-foreground hover:text-foreground flex items-center gap-1 rounded-full border border-dashed px-2.5 py-1"
        >
          <Plus className="size-3" />
          Add stage
        </button>
      )}
    </div>
  );
}
