import { XMLParser } from "fast-xml-parser";
import type { NewsSignal } from "@/db/schema";
import { fetchWithTimeout, USER_AGENT } from "./http";

const parser = new XMLParser({ ignoreAttributes: false });

type RssItem = {
  title?: string;
  link?: string;
  pubDate?: string;
};

/**
 * Name distinctiveness drives confidence. Only short single-word names that look
 * like real words ("Scale", "Ramp", "Notion") are flagged low; multi-word,
 * camelCase ("PostHog"), digit-bearing, or longer coined names are high.
 */
function nameConfidence(name: string): "high" | "low" {
  const n = name.trim();
  if (n.includes(" ")) return "high"; // multi-word
  if (/[a-z][A-Z]/.test(n)) return "high"; // camelCase brand
  if (/\d/.test(n)) return "high"; // has a digit
  return n.length >= 7 ? "high" : "low"; // longer single tokens are usually coined
}

/** Recent news volume for a startup, via Google News RSS (no key). */
export async function fetchNewsSignal(
  name: string,
): Promise<NewsSignal | null> {
  try {
    const q = encodeURIComponent(`"${name}"`);
    const res = await fetchWithTimeout(
      `https://news.google.com/rss/search?q=${q}&hl=en-US&gl=US&ceid=US:en`,
      { timeoutMs: 5000, headers: { "User-Agent": USER_AGENT } },
    );
    if (!res.ok) return null;
    const xml = await res.text();
    const parsed = parser.parse(xml) as {
      rss?: { channel?: { item?: RssItem | RssItem[] } };
    };

    const raw = parsed.rss?.channel?.item;
    const items: RssItem[] = Array.isArray(raw) ? raw : raw ? [raw] : [];
    const confidence = nameConfidence(name);

    if (items.length === 0) {
      return {
        count: 0,
        latestTitle: null,
        latestUrl: null,
        latestAt: null,
        confidence,
      };
    }

    // Google News RSS returns items newest-first.
    const latest = items[0];
    return {
      count: items.length,
      latestTitle: latest.title ?? null,
      latestUrl: latest.link ?? null,
      latestAt: latest.pubDate ?? null,
      confidence,
    };
  } catch {
    return null;
  }
}
