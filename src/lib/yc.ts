import { sql } from "drizzle-orm";
import { getDb } from "@/db";
import { startups } from "@/db/schema";

// Open-source, daily-updating mirror of YC's company directory. We deliberately
// pull from here rather than scraping ycombinator.com directly (see PRD 5.1a).
const YC_OSS_URL = "https://yc-oss.github.io/api/companies/all.json";

interface YcCompany {
  id: number;
  name: string;
  website?: string;
  one_liner?: string;
  long_description?: string;
  batch?: string;
  status?: string;
  industry?: string;
  subindustry?: string;
  tags?: string[];
  regions?: string[];
  team_size?: number | null;
}

export interface RefreshResult {
  fetched: number;
  processed: number;
}

/**
 * Fetch the full yc-oss company list and upsert it into `startups`.
 *
 * Idempotent: dedupes on `(source, external_id)`. On conflict the row is
 * updated in place but `first_seen_at` is left untouched, so freshly-inserted
 * companies can be surfaced as "new" later. Shared by the nightly Vercel Cron
 * route and the `pnpm db:refresh` CLI.
 */
export async function refreshYcStartups(): Promise<RefreshResult> {
  const res = await fetch(YC_OSS_URL, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`yc-oss fetch failed: ${res.status}`);
  }

  const companies = (await res.json()) as YcCompany[];
  const rows = companies
    .filter((c) => c && c.id != null && c.name)
    .map((c) => ({
      name: c.name,
      oneLiner: c.one_liner ?? null,
      description: c.long_description ?? null,
      website: c.website ?? null,
      batch: c.batch ?? null,
      status: c.status ?? null,
      industry: c.industry ?? null,
      subindustry: c.subindustry ?? null,
      tags: Array.isArray(c.tags) ? c.tags : [],
      regions: Array.isArray(c.regions) ? c.regions : [],
      teamSize: typeof c.team_size === "number" ? c.team_size : null,
      source: "yc-oss",
      externalId: String(c.id),
      sourceData: c,
    }));

  const db = getDb();
  const CHUNK = 500;
  let processed = 0;

  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
    await db
      .insert(startups)
      .values(chunk)
      .onConflictDoUpdate({
        target: [startups.source, startups.externalId],
        set: {
          name: sql`excluded.name`,
          oneLiner: sql`excluded.one_liner`,
          description: sql`excluded.description`,
          website: sql`excluded.website`,
          batch: sql`excluded.batch`,
          status: sql`excluded.status`,
          industry: sql`excluded.industry`,
          subindustry: sql`excluded.subindustry`,
          tags: sql`excluded.tags`,
          regions: sql`excluded.regions`,
          teamSize: sql`excluded.team_size`,
          sourceData: sql`excluded.source_data`,
          updatedAt: sql`now()`,
        },
      });
    processed += chunk.length;
  }

  return { fetched: companies.length, processed };
}
