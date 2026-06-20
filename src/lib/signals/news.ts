import { XMLParser } from "fast-xml-parser";
import type { NewsItem, NewsSignal } from "@/db/schema";
import { fetchWithTimeout, USER_AGENT } from "./http";

const parser = new XMLParser({ ignoreAttributes: false });

/** How many recent articles to keep for the clickable list. */
const TOP_ARTICLES = 10;

type RssItem = {
  title?: string;
  link?: string;
  pubDate?: string;
  // Google News tags each item with its outlet (text + @_url attribute).
  source?: string | { "#text"?: string } | null;
};

/** "Headline - The Verge" -> { title: "Headline", source: "The Verge" }. */
function splitTitle(raw: string, fallbackSource: string | null) {
  const idx = raw.lastIndexOf(" - ");
  if (idx > 0 && idx > raw.length - 60) {
    return {
      title: raw.slice(0, idx).trim(),
      source: raw.slice(idx + 3).trim(),
    };
  }
  return { title: raw.trim(), source: fallbackSource };
}

function readSource(s: RssItem["source"]): string | null {
  if (!s) return null;
  if (typeof s === "string") return s.trim() || null;
  return s["#text"]?.trim() || null;
}

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
    const rssItems: RssItem[] = Array.isArray(raw) ? raw : raw ? [raw] : [];
    const confidence = nameConfidence(name);

    if (rssItems.length === 0) {
      return {
        count: 0,
        latestTitle: null,
        latestUrl: null,
        latestAt: null,
        confidence,
      };
    }

    // Google News RSS returns items newest-first.
    const articles: NewsItem[] = rssItems
      .filter((it): it is RssItem & { title: string; link: string } =>
        Boolean(it.title && it.link),
      )
      .slice(0, TOP_ARTICLES)
      .map((it) => {
        const { title, source } = splitTitle(it.title, readSource(it.source));
        return { title, url: it.link, source, at: it.pubDate ?? null };
      });

    const latest = articles[0] ?? null;
    return {
      count: rssItems.length,
      latestTitle: latest?.title ?? null,
      latestUrl: latest?.url ?? null,
      latestAt: latest?.at ?? null,
      confidence,
      items: articles,
    };
  } catch {
    return null;
  }
}
