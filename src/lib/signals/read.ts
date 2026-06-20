import { desc, eq, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import { startupSignals } from "@/db/schema";
import type {
  GithubSignal,
  HackerNewsSignal,
  NewsSignal,
  StartupSignals,
} from "./types";

type Source = "github" | "hackernews" | "news";

function emptyBundle(): StartupSignals {
  return { github: null, hackernews: null, news: null };
}

function assign(
  target: StartupSignals,
  source: Source,
  payload: unknown,
): void {
  if (source === "github") target.github = payload as GithubSignal;
  else if (source === "hackernews")
    target.hackernews = payload as HackerNewsSignal;
  else target.news = payload as NewsSignal;
}

/** Latest snapshot per source for one startup. */
export async function getLatestSignals(
  startupId: string,
): Promise<StartupSignals> {
  const db = getDb();
  const rows = await db
    .selectDistinctOn([startupSignals.source], {
      source: startupSignals.source,
      payload: startupSignals.payload,
    })
    .from(startupSignals)
    .where(eq(startupSignals.startupId, startupId))
    .orderBy(startupSignals.source, desc(startupSignals.capturedAt));

  const out = emptyBundle();
  for (const r of rows) assign(out, r.source, r.payload);
  return out;
}

/** Latest snapshot per source for many startups, keyed by startup id. */
export async function getLatestSignalsForStartups(
  ids: string[],
): Promise<Map<string, StartupSignals>> {
  const map = new Map<string, StartupSignals>();
  if (ids.length === 0) return map;

  const db = getDb();
  const rows = await db
    .selectDistinctOn([startupSignals.startupId, startupSignals.source], {
      startupId: startupSignals.startupId,
      source: startupSignals.source,
      payload: startupSignals.payload,
    })
    .from(startupSignals)
    .where(inArray(startupSignals.startupId, ids))
    .orderBy(
      startupSignals.startupId,
      startupSignals.source,
      desc(startupSignals.capturedAt),
    );

  for (const r of rows) {
    let bucket = map.get(r.startupId);
    if (!bucket) {
      bucket = emptyBundle();
      map.set(r.startupId, bucket);
    }
    assign(bucket, r.source, r.payload);
  }
  return map;
}
