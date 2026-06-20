import { optionalEnv } from "@/lib/env";
import type { GithubSignal } from "@/db/schema";
import { fetchWithTimeout, USER_AGENT } from "./http";

// github.com paths that are never an org/user we care about.
const RESERVED = new Set([
  "about",
  "apps",
  "collections",
  "contact",
  "customer-stories",
  "enterprise",
  "explore",
  "features",
  "join",
  "login",
  "marketplace",
  "new",
  "orgs",
  "pricing",
  "pulls",
  "readme",
  "search",
  "security",
  "settings",
  "sponsors",
  "team",
  "topics",
  "trending",
]);

function githubHeaders(): HeadersInit {
  const token = optionalEnv("GITHUB_TOKEN");
  return {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": USER_AGENT,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/** Scan a company homepage for a github.com/<org> link. */
async function findGithubLinkOnSite(website: string): Promise<string | null> {
  try {
    const res = await fetchWithTimeout(website, {
      timeoutMs: 5000,
      headers: { "User-Agent": USER_AGENT },
      redirect: "follow",
    });
    if (!res.ok) return null;
    // Only the first chunk matters; footers/headers carry the social links.
    const html = (await res.text()).slice(0, 400_000);
    for (const m of html.matchAll(/github\.com\/([A-Za-z0-9-]{1,39})/gi)) {
      const slug = m[1];
      if (!RESERVED.has(slug.toLowerCase())) return slug;
    }
    return null;
  } catch {
    return null;
  }
}

/** Fall back to GitHub's org/user search when the site has no github link. */
async function searchGithubOrg(name: string): Promise<string | null> {
  try {
    const q = encodeURIComponent(`${name} type:org`);
    const res = await fetchWithTimeout(
      `https://api.github.com/search/users?q=${q}&per_page=1`,
      { timeoutMs: 5000, headers: githubHeaders() },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { items?: { login?: string }[] };
    const login = data.items?.[0]?.login;
    if (!login) return null;
    // Guard against loose matches: require the slug to share the name's start.
    const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
    return norm(login).startsWith(norm(name).slice(0, 4)) ? login : null;
  } catch {
    return null;
  }
}

/**
 * Resolve a startup to its GitHub org slug: prefer a github link on the company
 * website, fall back to GitHub org search. Returns null when nothing plausible.
 */
export async function resolveGithubOrg(
  website: string | null,
  name: string,
): Promise<string | null> {
  if (website) {
    const fromSite = await findGithubLinkOnSite(website);
    if (fromSite) return fromSite;
  }
  return searchGithubOrg(name);
}

type Repo = {
  stargazers_count?: number;
  language?: string | null;
  pushed_at?: string | null;
  fork?: boolean;
};

/** Lightweight org metrics: repo count, total stars, primary language, last push. */
export async function fetchGithubSignal(
  slug: string,
): Promise<GithubSignal | null> {
  // Most-recently-pushed public repos (one page is enough for a signal).
  const tryRepos = async (kind: "orgs" | "users") => {
    const res = await fetchWithTimeout(
      `https://api.github.com/${kind}/${slug}/repos?per_page=100&sort=pushed&type=public`,
      { timeoutMs: 6000, headers: githubHeaders() },
    );
    return res.ok ? ((await res.json()) as Repo[]) : null;
  };

  const repos = (await tryRepos("orgs")) ?? (await tryRepos("users"));
  if (!repos || repos.length === 0) return null;

  const owned = repos.filter((r) => !r.fork);
  const source = owned.length ? owned : repos;

  const stars = source.reduce((sum, r) => sum + (r.stargazers_count ?? 0), 0);
  const lastPushedAt = source.reduce<string | null>((latest, r) => {
    if (!r.pushed_at) return latest;
    return !latest || r.pushed_at > latest ? r.pushed_at : latest;
  }, null);

  // Primary language = most frequent across the sampled repos.
  const langCounts = new Map<string, number>();
  for (const r of source) {
    if (r.language)
      langCounts.set(r.language, (langCounts.get(r.language) ?? 0) + 1);
  }
  const primaryLanguage =
    [...langCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  const active = lastPushedAt
    ? Date.now() - new Date(lastPushedAt).getTime() < 30 * 24 * 60 * 60 * 1000
    : false;

  return {
    org: slug,
    repoCount: source.length,
    stars,
    primaryLanguage,
    lastPushedAt,
    active,
  };
}
