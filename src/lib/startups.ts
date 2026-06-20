import { and, asc, count, desc, eq, ilike, or, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { startups } from "@/db/schema";
import { getLatestSignalsForStartups } from "@/lib/signals/read";
import { EMPTY_SIGNALS, type StartupSignals } from "@/lib/signals/types";

export const STARTUPS_PAGE_SIZE = 40;

export type StartupRow = {
  id: string;
  name: string;
  oneLiner: string | null;
  description: string | null;
  website: string | null;
  ycUrl: string | null;
  batch: string | null;
  status: string | null;
  stage: string | null;
  industry: string | null;
  subindustry: string | null;
  tags: string[];
  regions: string[];
  teamSize: number | null;
  logoUrl: string | null;
  location: string | null;
  founderNames: string[];
  isNew: boolean;
  isHiring: boolean;
  // Latest cached signals (empty until enriched on view or by the nightly cron).
  signals: StartupSignals;
};

export type StartupFilters = {
  q?: string;
  batch?: string;
  industry?: string;
  stage?: string;
  status?: string;
  tags?: string[];
  hiring?: boolean;
  page?: number;
};

export type FilterOptions = {
  batches: string[];
  industries: string[];
  stages: string[];
  statuses: string[];
  tags: string[];
};

function buildWhere(f: StartupFilters) {
  const conds = [];
  const q = f.q?.trim();
  if (q) {
    const needle = `%${q}%`;
    conds.push(
      or(
        ilike(startups.name, needle),
        ilike(startups.oneLiner, needle),
        ilike(startups.industry, needle),
        ilike(startups.location, needle),
      ),
    );
  }
  if (f.batch) conds.push(eq(startups.batch, f.batch));
  if (f.industry) conds.push(eq(startups.industry, f.industry));
  if (f.stage) conds.push(eq(startups.stage, f.stage));
  if (f.status) conds.push(eq(startups.status, f.status));
  // Match rows whose tags jsonb array contains ANY of the selected tags.
  // jsonb_exists(tags, $tag) backs the `?` operator; OR-ing scalar-bound calls
  // avoids the array-param pitfall of the `?|` operator through the driver.
  if (f.tags?.length) {
    conds.push(
      or(...f.tags.map((t) => sql`jsonb_exists(${startups.tags}, ${t})`)),
    );
  }
  // isHiring lives in the raw source payload (not its own column).
  if (f.hiring) {
    conds.push(sql`(${startups.sourceData}->>'isHiring')::boolean is true`);
  }
  return conds.length ? and(...conds) : undefined;
}

export async function queryStartups(
  f: StartupFilters,
): Promise<{ rows: StartupRow[]; total: number; hasMore: boolean }> {
  const db = getDb();
  const page = Math.max(1, f.page ?? 1);
  const where = buildWhere(f);

  const [rows, [{ total }]] = await Promise.all([
    db
      .select({
        id: startups.id,
        name: startups.name,
        oneLiner: startups.oneLiner,
        description: startups.description,
        website: startups.website,
        ycUrl: sql<string | null>`${startups.sourceData}->>'url'`,
        batch: startups.batch,
        status: startups.status,
        stage: startups.stage,
        industry: startups.industry,
        subindustry: startups.subindustry,
        tags: startups.tags,
        regions: startups.regions,
        teamSize: startups.teamSize,
        logoUrl: startups.logoUrl,
        location: startups.location,
        founderNames: startups.founderNames,
        isNew: sql<boolean>`${startups.firstSeenAt} > now() - make_interval(days => 7)`,
        isHiring: sql<boolean>`coalesce((${startups.sourceData}->>'isHiring')::boolean, false)`,
      })
      .from(startups)
      .where(where)
      .orderBy(desc(startups.firstSeenAt), asc(startups.name))
      .limit(STARTUPS_PAGE_SIZE)
      .offset((page - 1) * STARTUPS_PAGE_SIZE),
    db.select({ total: count() }).from(startups).where(where),
  ]);

  // Attach cached signals for just this page's rows (one extra query).
  const signalsById = await getLatestSignalsForStartups(rows.map((r) => r.id));
  const withSignals: StartupRow[] = rows.map((r) => ({
    ...r,
    signals: signalsById.get(r.id) ?? EMPTY_SIGNALS,
  }));

  return {
    rows: withSignals,
    total,
    hasMore: page * STARTUPS_PAGE_SIZE < total,
  };
}

export async function getFilterOptions(): Promise<FilterOptions> {
  const db = getDb();
  const distinct = async (
    col:
      | typeof startups.batch
      | typeof startups.industry
      | typeof startups.stage
      | typeof startups.status,
  ) => {
    const rows = await db
      .selectDistinct({ v: col })
      .from(startups)
      .where(sql`${col} is not null and ${col} <> ''`)
      .orderBy(asc(col));
    return rows.map((r) => r.v).filter((v): v is string => Boolean(v));
  };

  const [batches, industries, stages, statuses, tagRows] = await Promise.all([
    distinct(startups.batch),
    distinct(startups.industry),
    distinct(startups.stage),
    distinct(startups.status),
    // Expand the tags jsonb arrays into a distinct, flat list.
    db
      .selectDistinct({
        tag: sql<string>`jsonb_array_elements_text(${startups.tags})`,
      })
      .from(startups),
  ]);
  const tags = tagRows
    .map((r) => r.tag)
    .filter((v): v is string => Boolean(v))
    .sort((a, b) => a.localeCompare(b));
  // Batches read best newest-first.
  return { batches: batches.reverse(), industries, stages, statuses, tags };
}
