import { type NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { trackerEntries } from "@/db/schema";
import { enrichStartup } from "@/lib/signals/enrich";

export const dynamic = "force-dynamic";
// Enrichment makes several outbound calls per startup; give it room.
export const maxDuration = 60;

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

/** Run an async task over items with a bounded number in flight at once. */
async function mapWithConcurrency<T>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<void>,
): Promise<void> {
  let cursor = 0;
  const workers = Array.from(
    { length: Math.min(limit, items.length) },
    async () => {
      while (cursor < items.length) {
        const idx = cursor++;
        await fn(items[idx]);
      }
    },
  );
  await Promise.all(workers);
}

/**
 * Nightly: refresh signals for every startup that's in someone's tracker. These
 * are the startups users actually care about, so they always have fresh data.
 * Cold startups are enriched lazily on first view (see getStartupSignals).
 */
export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = getDb();
    const rows = await db
      .selectDistinct({ startupId: trackerEntries.startupId })
      .from(trackerEntries);
    const ids = rows.map((r) => r.startupId);

    let refreshed = 0;
    await mapWithConcurrency(ids, 4, async (id) => {
      await enrichStartup(id, { force: false });
      refreshed++;
    });

    return NextResponse.json({ ok: true, tracked: ids.length, refreshed });
  } catch (err) {
    const message = err instanceof Error ? err.message : "refresh failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
