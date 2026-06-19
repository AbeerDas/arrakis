import type { Metadata } from "next";
import Link from "next/link";
import {
  and,
  count,
  desc,
  eq,
  getTableColumns,
  ilike,
  or,
  sql,
} from "drizzle-orm";
import { getDb } from "@/db";
import { startups } from "@/db/schema";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Startups" };

const PAGE_SIZE = 48;
const NEW_WINDOW_DAYS = 7;

type SearchParams = Promise<{ q?: string; batch?: string; page?: string }>;

function buildHref(params: Record<string, string | number | undefined>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "" && v !== null) sp.set(k, String(v));
  }
  const qs = sp.toString();
  return qs ? `/startups?${qs}` : "/startups";
}

export default async function StartupsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { q = "", batch = "", page: pageParam } = await searchParams;
  const page = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);
  const db = getDb();

  // Filters: free-text search across name/one-liner/industry, plus a batch pick.
  const filters = [];
  if (q.trim()) {
    const needle = `%${q.trim()}%`;
    filters.push(
      or(
        ilike(startups.name, needle),
        ilike(startups.oneLiner, needle),
        ilike(startups.industry, needle),
      ),
    );
  }
  if (batch) filters.push(eq(startups.batch, batch));
  const where = filters.length ? and(...filters) : undefined;

  const [rows, [{ total }], batchRows] = await Promise.all([
    db
      .select({
        ...getTableColumns(startups),
        // Flagged in SQL so render stays pure (no Date.now during render).
        isNew: sql<boolean>`${startups.firstSeenAt} > now() - make_interval(days => ${NEW_WINDOW_DAYS})`,
      })
      .from(startups)
      .where(where)
      .orderBy(desc(startups.firstSeenAt), startups.name)
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db.select({ total: count() }).from(startups).where(where),
    // Distinct batches for the filter dropdown, newest-looking first.
    db
      .select({ batch: startups.batch })
      .from(startups)
      .where(sql`${startups.batch} is not null and ${startups.batch} <> ''`)
      .groupBy(startups.batch)
      .orderBy(desc(startups.batch)),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const batches = batchRows.map((b) => b.batch).filter(Boolean) as string[];

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Startups</h1>
        <span className="text-sm text-muted-foreground">
          {total.toLocaleString()} total
        </span>
      </div>
      <p className="mt-2 text-muted-foreground">
        The full yc-oss company list, refreshed nightly. Newest additions first.
      </p>

      <form className="mt-6 flex flex-wrap gap-2" action="/startups">
        <Input
          name="q"
          defaultValue={q}
          placeholder="Search name, one-liner, or industry…"
          className="max-w-xs"
        />
        <select
          name="batch"
          defaultValue={batch}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">All batches</option>
          {batches.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className={cn(buttonVariants({ variant: "default", size: "default" }))}
        >
          Search
        </button>
        {(q || batch) && (
          <Link
            href="/startups"
            className={cn(buttonVariants({ variant: "ghost", size: "default" }))}
          >
            Clear
          </Link>
        )}
      </form>

      {rows.length === 0 ? (
        <p className="mt-10 text-center text-muted-foreground">
          No startups match your filters.
        </p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((s) => {
            const isNew = s.isNew;
            return (
              <div
                key={s.id}
                className="flex flex-col rounded-lg border p-5 transition-colors hover:bg-accent/40"
              >
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-medium leading-tight">{s.name}</h2>
                  {isNew && (
                    <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      New
                    </span>
                  )}
                </div>
                {s.oneLiner && (
                  <p className="mt-1.5 line-clamp-3 text-sm text-muted-foreground">
                    {s.oneLiner}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {s.batch && (
                    <span className="rounded border px-1.5 py-0.5 text-xs text-muted-foreground">
                      {s.batch}
                    </span>
                  )}
                  {s.industry && (
                    <span className="rounded border px-1.5 py-0.5 text-xs text-muted-foreground">
                      {s.industry}
                    </span>
                  )}
                  {typeof s.teamSize === "number" && s.teamSize > 0 && (
                    <span className="rounded border px-1.5 py-0.5 text-xs text-muted-foreground">
                      {s.teamSize} ppl
                    </span>
                  )}
                </div>
                {s.website && (
                  <a
                    href={s.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 text-sm text-primary underline-offset-4 hover:underline"
                  >
                    Visit site →
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4">
          {page > 1 ? (
            <Link
              href={buildHref({ q, batch, page: page - 1 })}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              ← Previous
            </Link>
          ) : (
            <span
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "pointer-events-none opacity-50",
              )}
            >
              ← Previous
            </span>
          )}
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          {page < totalPages ? (
            <Link
              href={buildHref({ q, batch, page: page + 1 })}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              Next →
            </Link>
          ) : (
            <span
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "pointer-events-none opacity-50",
              )}
            >
              Next →
            </span>
          )}
        </div>
      )}
    </div>
  );
}
