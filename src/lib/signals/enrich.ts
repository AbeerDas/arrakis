import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { startups, startupSignals, type SignalPayload } from "@/db/schema";
import { fetchGithubSignal, resolveGithubOrg } from "./github";
import { fetchHnSignal } from "./hackernews";
import { fetchNewsSignal } from "./news";
import { getLatestSignals } from "./read";
import {
  GITHUB_RESOLVE_TTL_MS,
  SIGNAL_TTL_MS,
  type StartupSignals,
} from "./types";

type Source = "github" | "hackernews" | "news";

/** Most-recent capture time per source, for TTL checks. */
async function latestCapturedBySource(
  startupId: string,
): Promise<Map<Source, Date>> {
  const db = getDb();
  const rows = await db
    .selectDistinctOn([startupSignals.source], {
      source: startupSignals.source,
      capturedAt: startupSignals.capturedAt,
    })
    .from(startupSignals)
    .where(eq(startupSignals.startupId, startupId))
    .orderBy(startupSignals.source, desc(startupSignals.capturedAt));

  const m = new Map<Source, Date>();
  for (const r of rows) m.set(r.source as Source, r.capturedAt);
  return m;
}

function isFresh(at: Date | undefined, now: number): boolean {
  return at ? now - at.getTime() < SIGNAL_TTL_MS : false;
}

/**
 * Refresh a startup's signals, respecting per-source TTL (override with `force`).
 * Fetches happen in parallel and failures are swallowed per source, so a slow or
 * down provider never blocks the others. Returns the latest bundle after writing.
 *
 * This is the single enrichment entry point: on-demand (detail view) and the
 * nightly cron both call it.
 */
export async function enrichStartup(
  startupId: string,
  opts: { force?: boolean } = {},
): Promise<StartupSignals> {
  const db = getDb();
  const rows = await db
    .select({
      name: startups.name,
      website: startups.website,
      githubUrl: startups.githubUrl,
      githubResolvedAt: startups.githubResolvedAt,
    })
    .from(startups)
    .where(eq(startups.id, startupId))
    .limit(1);
  const startup = rows[0];
  if (!startup) return getLatestSignals(startupId);

  const now = Date.now();
  const force = opts.force ?? false;
  const latest = await latestCapturedBySource(startupId);

  // Resolve (or re-resolve) the GitHub org on its own long TTL. A null url with
  // a set timestamp is a negative cache (we looked, found nothing).
  let githubUrl = startup.githubUrl;
  const resolveStale =
    !startup.githubResolvedAt ||
    now - startup.githubResolvedAt.getTime() > GITHUB_RESOLVE_TTL_MS;
  if (resolveStale) {
    const slug = await resolveGithubOrg(startup.website, startup.name);
    githubUrl = slug ? `https://github.com/${slug}` : null;
    await db
      .update(startups)
      .set({ githubUrl, githubResolvedAt: new Date() })
      .where(eq(startups.id, startupId));
  }

  const toInsert: { source: Source; payload: SignalPayload }[] = [];
  const jobs: Promise<void>[] = [];

  if (force || !isFresh(latest.get("github"), now)) {
    const slug = githubUrl?.split("/").pop() || null;
    if (slug) {
      jobs.push(
        fetchGithubSignal(slug).then((p) => {
          if (p) toInsert.push({ source: "github", payload: p });
        }),
      );
    }
  }
  if (force || !isFresh(latest.get("hackernews"), now)) {
    jobs.push(
      fetchHnSignal(startup.name).then((p) => {
        if (p) toInsert.push({ source: "hackernews", payload: p });
      }),
    );
  }
  if (force || !isFresh(latest.get("news"), now)) {
    jobs.push(
      fetchNewsSignal(startup.name).then((p) => {
        if (p) toInsert.push({ source: "news", payload: p });
      }),
    );
  }

  await Promise.allSettled(jobs);

  if (toInsert.length) {
    await db.insert(startupSignals).values(
      toInsert.map((s) => ({
        startupId,
        source: s.source,
        payload: s.payload,
      })),
    );
  }

  return getLatestSignals(startupId);
}
