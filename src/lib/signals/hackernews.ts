import type { HackerNewsSignal } from "@/db/schema";
import { fetchWithTimeout, USER_AGENT } from "./http";

type AlgoliaHit = {
  objectID: string;
  title?: string | null;
  url?: string | null;
  points?: number | null;
  num_comments?: number | null;
  created_at?: string | null;
};

/** Hacker News story activity for a startup, via the public Algolia API (no key). */
export async function fetchHnSignal(
  name: string,
): Promise<HackerNewsSignal | null> {
  try {
    // Quoted to keep matches tight for multi-word names.
    const q = encodeURIComponent(`"${name}"`);
    const res = await fetchWithTimeout(
      `https://hn.algolia.com/api/v1/search?query=${q}&tags=story&hitsPerPage=30`,
      { timeoutMs: 5000, headers: { "User-Agent": USER_AGENT } },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      nbHits?: number;
      hits?: AlgoliaHit[];
    };
    const hits = data.hits ?? [];
    if (hits.length === 0) {
      return {
        stories: 0,
        points: 0,
        comments: 0,
        latestTitle: null,
        latestUrl: null,
        latestAt: null,
      };
    }

    // Most-upvoted story drives the headline points/comments.
    const top = [...hits].sort((a, b) => (b.points ?? 0) - (a.points ?? 0))[0];
    // Most-recent story drives the "latest" link.
    const latest = [...hits].sort((a, b) =>
      (b.created_at ?? "").localeCompare(a.created_at ?? ""),
    )[0];

    return {
      stories: data.nbHits ?? hits.length,
      points: top.points ?? 0,
      comments: top.num_comments ?? 0,
      latestTitle: latest.title ?? null,
      latestUrl: latest.objectID
        ? `https://news.ycombinator.com/item?id=${latest.objectID}`
        : null,
      latestAt: latest.created_at ?? null,
    };
  } catch {
    return null;
  }
}
