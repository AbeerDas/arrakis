import type { GithubSignal, HackerNewsSignal, NewsSignal } from "@/db/schema";

export type { GithubSignal, HackerNewsSignal, NewsSignal };

/** How long a source's snapshot stays fresh before an on-demand re-fetch. */
export const SIGNAL_TTL_MS = 3 * 24 * 60 * 60 * 1000; // 3 days
/** Don't re-attempt GitHub org resolution (success or miss) more often than this. */
export const GITHUB_RESOLVE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

/** Latest-per-source bundle for a startup. This is what the UI reads. */
export type StartupSignals = {
  github: GithubSignal | null;
  hackernews: HackerNewsSignal | null;
  news: NewsSignal | null;
};

export const EMPTY_SIGNALS: StartupSignals = {
  github: null,
  hackernews: null,
  news: null,
};

/** True when the bundle has no data from any source (nothing worth rendering). */
export function isEmptySignals(s: StartupSignals): boolean {
  return !s.github && !s.hackernews && !s.news;
}
