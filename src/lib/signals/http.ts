/** fetch() with an abort-based timeout. Used by every signal fetcher so a slow
 *  company homepage or third-party API can't hang an on-demand enrichment. */
export async function fetchWithTimeout(
  url: string,
  init: (RequestInit & { timeoutMs?: number }) | undefined = {},
): Promise<Response> {
  const { timeoutMs = 6000, ...rest } = init;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...rest, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/** A User-Agent is required by GitHub and good manners everywhere else. */
export const USER_AGENT = "arrakis-signals (+https://github.com)";
