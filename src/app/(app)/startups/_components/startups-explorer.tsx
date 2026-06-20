"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  ExternalLink,
  LayoutGrid,
  List,
  Mail,
  Search,
} from "lucide-react";
import type { FilterOptions, StartupRow } from "@/lib/startups";
import { cn } from "@/lib/utils";
import { OutreachModal } from "./outreach-modal";
import { SignalBadges } from "./signals-ui";
import { StartupDetail } from "./startup-detail";

type View = "list" | "tile";

function Logo({ row, size }: { row: StartupRow; size: number }) {
  if (row.logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={row.logoUrl}
        alt=""
        width={size}
        height={size}
        loading="lazy"
        className="border-border/60 bg-card shrink-0 rounded-md border object-contain p-1"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      className="bg-foreground/10 flex shrink-0 items-center justify-center rounded-md text-sm font-medium"
      style={{ width: size, height: size }}
    >
      {row.name.charAt(0)}
    </span>
  );
}

function Select({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: string[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border-input bg-background h-9 w-full appearance-none rounded-lg border px-2.5 pr-7 text-sm"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <ChevronDown className="text-muted-foreground pointer-events-none absolute top-1/2 right-2 size-3.5 -translate-y-1/2" />
    </div>
  );
}

/** Searchable multi-select tag dropdown. Matches rows that have ANY checked tag. */
function TagFilter({
  options,
  selected,
  onToggle,
  onClear,
}: {
  options: string[];
  selected: string[];
  onToggle: (tag: string) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const needle = search.trim().toLowerCase();
  const filtered = needle
    ? options.filter((t) => t.toLowerCase().includes(needle))
    : options;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="border-input bg-background hover:bg-accent flex h-9 items-center gap-1.5 rounded-lg border px-2.5 text-sm transition-colors"
      >
        Tags
        {selected.length > 0 ? (
          <span className="bg-spice/15 text-spice rounded-full px-1.5 text-xs font-medium">
            {selected.length}
          </span>
        ) : null}
        <ChevronDown className="text-muted-foreground size-3.5" />
      </button>

      {open ? (
        <div className="bg-popover text-popover-foreground absolute left-0 z-30 mt-1.5 w-64 rounded-xl border p-2 shadow-lg">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tags"
            autoFocus
            className="border-input bg-background mb-2 h-8 w-full rounded-md border px-2 text-sm focus-visible:outline-none"
          />
          <div className="max-h-64 space-y-0.5 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-muted-foreground px-2 py-3 text-center text-xs">
                No tags match.
              </p>
            ) : (
              filtered.map((t) => {
                const checked = selected.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => onToggle(t)}
                    className="hover:bg-accent flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm"
                  >
                    <span
                      className={cn(
                        "flex size-4 shrink-0 items-center justify-center rounded border",
                        checked
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-input",
                      )}
                    >
                      {checked ? <Check className="size-3" /> : null}
                    </span>
                    <span className="truncate">{t}</span>
                  </button>
                );
              })
            )}
          </div>
          {selected.length > 0 ? (
            <button
              type="button"
              onClick={onClear}
              className="text-muted-foreground hover:text-foreground mt-1.5 w-full rounded-md px-2 py-1 text-left text-xs"
            >
              Clear tags
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function StartupsExplorer({
  initialRows,
  initialTotal,
  initialHasMore,
  options,
}: {
  initialRows: StartupRow[];
  initialTotal: number;
  initialHasMore: boolean;
  options: FilterOptions;
}) {
  const [q, setQ] = useState("");
  const [batch, setBatch] = useState("");
  const [industry, setIndustry] = useState("");
  const [stage, setStage] = useState("");
  const [status, setStatus] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [hiring, setHiring] = useState(false);
  const [view, setView] = useState<View>("list");

  const [rows, setRows] = useState(initialRows);
  const [total, setTotal] = useState(initialTotal);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<StartupRow | null>(null);
  const [outreachCompany, setOutreachCompany] = useState<StartupRow | null>(
    null,
  );

  const pageRef = useRef(1);
  const reqRef = useRef(0);
  const firstRun = useRef(true);

  const params = useCallback(
    (page: number) => {
      const p = new URLSearchParams();
      if (q) p.set("q", q);
      if (batch) p.set("batch", batch);
      if (industry) p.set("industry", industry);
      if (stage) p.set("stage", stage);
      if (status) p.set("status", status);
      for (const t of tags) p.append("tags", t);
      if (hiring) p.set("hiring", "1");
      p.set("page", String(page));
      return p.toString();
    },
    [q, batch, industry, stage, status, tags, hiring],
  );

  const fetchPage = useCallback(
    async (page: number, reset: boolean) => {
      const id = ++reqRef.current;
      setLoading(true);
      try {
        const res = await fetch(`/api/startups?${params(page)}`);
        const data = (await res.json()) as {
          rows: StartupRow[];
          total: number;
          hasMore: boolean;
        };
        if (id !== reqRef.current) return;
        pageRef.current = page;
        setRows((prev) => (reset ? data.rows : [...prev, ...data.rows]));
        setTotal(data.total);
        setHasMore(data.hasMore);
      } finally {
        if (id === reqRef.current) setLoading(false);
      }
    },
    [params],
  );

  // Refetch (reset to page 1) when filters change, debounced. Skips the first
  // run since the server already provided the unfiltered first page.
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    const t = setTimeout(() => {
      void fetchPage(1, true);
    }, 250);
    return () => clearTimeout(t);
  }, [fetchPage]);

  // Infinite scroll: load next page when the sentinel enters view.
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !loading) {
          void fetchPage(pageRef.current + 1, false);
        }
      },
      { rootMargin: "400px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, loading, fetchPage]);

  const hasFilters = Boolean(
    q || batch || industry || stage || status || tags.length || hiring,
  );
  const clearAll = () => {
    setQ("");
    setBatch("");
    setIndustry("");
    setStage("");
    setStatus("");
    setTags([]);
    setHiring(false);
  };
  const toggleTag = (t: string) =>
    setTags((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
    );

  return (
    <div>
      {/* filter bar — search + view on top, filters on their own row below */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, one-liner, industry, location"
              className="border-input bg-background focus-visible:ring-ring h-9 w-full rounded-lg border pr-3 pl-9 text-sm focus-visible:ring-2 focus-visible:outline-none"
            />
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              onClick={() => setView("list")}
              aria-label="List view"
              aria-pressed={view === "list"}
              className={cn(
                "rounded-md p-1.5 transition-colors",
                view === "list"
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <List className="size-4" />
            </button>
            <button
              onClick={() => setView("tile")}
              aria-label="Grid view"
              aria-pressed={view === "tile"}
              className={cn(
                "rounded-md p-1.5 transition-colors",
                view === "tile"
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <LayoutGrid className="size-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={batch}
            onChange={setBatch}
            placeholder="Batch"
            options={options.batches}
          />
          <Select
            value={industry}
            onChange={setIndustry}
            placeholder="Industry"
            options={options.industries}
          />
          <Select
            value={stage}
            onChange={setStage}
            placeholder="Stage"
            options={options.stages}
          />
          <Select
            value={status}
            onChange={setStatus}
            placeholder="Status"
            options={options.statuses}
          />
          <TagFilter
            options={options.tags}
            selected={tags}
            onToggle={toggleTag}
            onClear={() => setTags([])}
          />
          <button
            type="button"
            onClick={() => setHiring((h) => !h)}
            aria-pressed={hiring}
            className={cn(
              "h-9 rounded-lg border px-3 text-sm transition-colors",
              hiring
                ? "border-spice bg-spice/10 text-spice"
                : "border-input bg-background hover:bg-accent",
            )}
          >
            Hiring now
          </button>
          {hasFilters ? (
            <button
              onClick={clearAll}
              className="text-muted-foreground hover:text-foreground text-sm underline-offset-4 hover:underline"
            >
              Clear
            </button>
          ) : null}
        </div>
      </div>

      <p className="text-muted-foreground mt-3 text-sm">
        {total.toLocaleString()} {total === 1 ? "startup" : "startups"}
      </p>

      {/* results */}
      {rows.length === 0 && !loading ? (
        <p className="text-muted-foreground mt-16 text-center">
          No startups match these filters.
        </p>
      ) : view === "list" ? (
        <div className="mt-4">
          {rows.map((r) => (
            <div
              key={r.id}
              className="border-border/60 hover:bg-accent/40 flex w-full items-center gap-4 border-b py-3 transition-colors"
            >
              {/* left: logo + text — clicking opens detail */}
              <button
                onClick={() => setSelected(r)}
                className="flex min-w-0 flex-1 items-center gap-4 text-left"
              >
                <Logo row={r} size={40} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium">{r.name}</span>
                    {r.isNew ? (
                      <span className="bg-spice/10 text-spice rounded-full px-2 py-0.5 text-xs">
                        New
                      </span>
                    ) : null}
                  </div>
                  {r.oneLiner ? (
                    <p className="text-muted-foreground truncate text-sm">
                      {r.oneLiner}
                    </p>
                  ) : null}
                  <SignalBadges signals={r.signals} className="mt-1" />
                </div>
              </button>

              {/* right: batch on the left, actions pushed to the outside */}
              <div className="hidden shrink-0 items-center gap-3 sm:flex">
                {r.batch ? (
                  <span className="text-muted-foreground shrink-0 text-right text-xs whitespace-nowrap">
                    {r.batch}
                  </span>
                ) : null}
                <button
                  onClick={() => setOutreachCompany(r)}
                  aria-label={`Cold outreach for ${r.name}`}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Mail className="size-4" />
                </button>
                {r.website ? (
                  <a
                    href={r.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Visit ${r.name}`}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ExternalLink className="size-4" />
                  </a>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelected(r)}
              className="border-border/60 hover:bg-accent/40 flex flex-col rounded-xl border p-4 text-left transition-colors"
            >
              <div className="flex items-center gap-3">
                <Logo row={r} size={36} />
                <span className="min-w-0 flex-1 truncate font-medium">
                  {r.name}
                </span>
                {r.isNew ? (
                  <span className="bg-spice/10 text-spice rounded-full px-2 py-0.5 text-xs">
                    New
                  </span>
                ) : null}
              </div>
              {r.oneLiner ? (
                <p className="text-muted-foreground mt-3 line-clamp-2 text-sm">
                  {r.oneLiner}
                </p>
              ) : null}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {r.batch ? (
                  <span className="border-border/70 text-muted-foreground rounded-full border px-2 py-0.5 text-xs whitespace-nowrap">
                    {r.batch}
                  </span>
                ) : null}
                {r.location ? (
                  <span className="border-border/70 text-muted-foreground rounded-full border px-2 py-0.5 text-xs whitespace-nowrap">
                    {r.location.split(",")[0]}
                  </span>
                ) : null}
              </div>
              <SignalBadges signals={r.signals} className="mt-2" />
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <p className="text-muted-foreground mt-6 text-center text-sm">
          Loading…
        </p>
      ) : null}
      <div ref={sentinelRef} className="h-px" />

      {selected ? (
        <StartupDetail
          key={selected.id}
          startup={selected}
          onClose={() => setSelected(null)}
        />
      ) : null}

      {outreachCompany ? (
        <OutreachModal
          companyId={outreachCompany.id}
          companyName={outreachCompany.name}
          onClose={() => setOutreachCompany(null)}
        />
      ) : null}
    </div>
  );
}
