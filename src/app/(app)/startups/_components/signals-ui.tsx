"use client";

import { useState } from "react";
import { ArrowUpRight, Code2, Flame, Newspaper, Star } from "lucide-react";
import type { StartupSignals } from "@/lib/signals/types";
import { isEmptySignals } from "@/lib/signals/types";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/** 1234 -> "1.2k", 980 -> "980". */
function compact(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return String(n);
}

/** Tiny inline badges for a startup list/grid row. Renders nothing when empty. */
export function SignalBadges({
  signals,
  className,
}: {
  signals: StartupSignals;
  className?: string;
}) {
  const { github, hackernews, news } = signals;
  const show =
    (github && github.stars > 0) ||
    github?.active ||
    (news && news.count > 0) ||
    (hackernews && hackernews.stories > 0);
  if (!show) return null;

  return (
    <div
      className={cn(
        "text-muted-foreground flex items-center gap-2.5 text-xs",
        className,
      )}
    >
      {github && (github.stars > 0 || github.active) ? (
        <Tooltip
          label={`${compact(github.stars)} GitHub stars${github.active ? " · actively shipping" : ""}`}
        >
          <span className="flex items-center gap-1">
            <Star className="size-3" />
            {compact(github.stars)}
            {github.active ? (
              <span className="bg-spice ml-0.5 inline-block size-1.5 rounded-full" />
            ) : null}
          </span>
        </Tooltip>
      ) : null}
      {news && news.count > 0 ? (
        <Tooltip label={`${news.count} recent news articles mention them`}>
          <span className="flex items-center gap-1">
            <Newspaper className="size-3" />
            {compact(news.count)}
          </span>
        </Tooltip>
      ) : null}
      {hackernews && hackernews.stories > 0 ? (
        <Tooltip
          label={`${hackernews.stories} Hacker News stories · top post ${hackernews.points} points`}
        >
          <span className="flex items-center gap-1">
            <Flame className="size-3" />
            {compact(hackernews.points)}
          </span>
        </Tooltip>
      ) : null}
    </div>
  );
}

function relativeAge(iso: string | null): string | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return null;
  const days = Math.floor((Date.now() - t) / (24 * 60 * 60 * 1000));
  if (days <= 0) return "today";
  if (days === 1) return "1d ago";
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return months < 12 ? `${months}mo ago` : `${Math.floor(months / 12)}y ago`;
}

/** A clearly-clickable row that opens an external link in a new tab. */
function ItemLink({
  href,
  title,
  meta,
  hint,
  lead,
}: {
  href: string;
  title: string;
  meta?: string | null;
  hint: string;
  lead?: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={hint}
      className="group/item hover:bg-accent/60 -mx-2 flex items-start gap-2 rounded-md px-2 py-1.5 transition-colors"
    >
      <div className="min-w-0 flex-1">
        <p className="text-foreground/90 group-hover/item:text-foreground flex items-center gap-1.5 text-xs underline-offset-2 group-hover/item:underline">
          {lead}
          <span className="truncate">{title}</span>
        </p>
        {meta ? (
          <p className="text-muted-foreground text-[11px]">{meta}</p>
        ) : null}
      </div>
      <ArrowUpRight className="text-muted-foreground/50 group-hover/item:text-foreground mt-0.5 size-3.5 shrink-0" />
    </a>
  );
}

/** Shows the first `initial` children, then a toggle to reveal the rest. */
function Expandable({
  count,
  initial = 3,
  children,
}: {
  count: number;
  initial?: number;
  children: React.ReactNode[];
}) {
  const [open, setOpen] = useState(false);
  const shown = open ? children : children.slice(0, initial);
  const remaining = count - initial;
  return (
    <div className="mt-1 space-y-0.5">
      {shown}
      {remaining > 0 ? (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="text-muted-foreground hover:text-foreground -mx-2 px-2 py-1 text-xs font-medium"
        >
          {open ? "Show less" : `Show ${remaining} more`}
        </button>
      ) : null}
    </div>
  );
}

function SectionHeader({
  icon,
  label,
  summary,
  href,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  summary: React.ReactNode;
  href?: string;
  hint?: string;
}) {
  const head = (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground shrink-0">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
      {href ? (
        <ArrowUpRight className="text-muted-foreground/60 size-3.5" />
      ) : null}
    </div>
  );
  return (
    <div>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          title={hint}
          className="hover:[&_span]:text-foreground inline-flex items-center underline-offset-2 hover:underline"
        >
          {head}
        </a>
      ) : (
        head
      )}
      <p className="text-muted-foreground mt-0.5 text-xs">{summary}</p>
    </div>
  );
}

/** The full "Signals" section in the startup detail modal. */
export function SignalsPanel({
  signals,
  loading,
}: {
  signals: StartupSignals;
  loading: boolean;
}) {
  const { github, hackernews, news } = signals;

  if (loading && isEmptySignals(signals)) {
    return (
      <div>
        <h3 className="text-muted-foreground text-xs tracking-wide uppercase">
          Signals
        </h3>
        <div className="mt-2 space-y-2">
          <div className="bg-muted h-4 w-2/3 animate-pulse rounded" />
          <div className="bg-muted h-4 w-1/2 animate-pulse rounded" />
        </div>
      </div>
    );
  }

  if (isEmptySignals(signals)) {
    return (
      <div>
        <h3 className="text-muted-foreground text-xs tracking-wide uppercase">
          Signals
        </h3>
        <p className="text-muted-foreground mt-1.5 text-sm">
          No public activity signals found.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <h3 className="text-muted-foreground text-xs tracking-wide uppercase">
          Signals
        </h3>
        {loading ? (
          <span className="text-muted-foreground/70 text-[11px]">
            refreshing…
          </span>
        ) : null}
      </div>

      <div className="mt-3 space-y-5">
        {github ? (
          <div>
            <SectionHeader
              icon={<Code2 className="size-4" />}
              label="GitHub"
              href={`https://github.com/${github.org}`}
              hint={`Open github.com/${github.org} in a new tab`}
              summary={
                <>
                  {compact(github.stars)} stars
                  {github.forks ? ` · ${compact(github.forks)} forks` : ""}
                  {github.repoCount ? ` · ${github.repoCount} repos` : ""}
                  {github.primaryLanguage ? ` · ${github.primaryLanguage}` : ""}
                  {github.active ? (
                    <span className="text-spice"> · active</span>
                  ) : github.lastPushedAt ? (
                    ` · pushed ${relativeAge(github.lastPushedAt)}`
                  ) : (
                    ""
                  )}
                </>
              }
            />
            {github.repos && github.repos.length > 0 ? (
              <Expandable count={github.repos.length}>
                {github.repos.map((r) => (
                  <ItemLink
                    key={r.url}
                    href={r.url}
                    title={r.name}
                    hint={`Open the ${r.name} repo on GitHub`}
                    lead={
                      <span className="text-muted-foreground inline-flex shrink-0 items-center gap-0.5">
                        <Star className="size-3" />
                        {compact(r.stars)}
                      </span>
                    }
                    meta={
                      [
                        r.language,
                        r.pushedAt ? `pushed ${relativeAge(r.pushedAt)}` : null,
                      ]
                        .filter(Boolean)
                        .join(" · ") || null
                    }
                  />
                ))}
              </Expandable>
            ) : null}
          </div>
        ) : null}

        {news && news.count > 0 ? (
          <div>
            <SectionHeader
              icon={<Newspaper className="size-4" />}
              label="In the news"
              summary={
                <>
                  {news.count} recent{" "}
                  {news.count === 1 ? "article" : "articles"}
                  {news.confidence === "low" ? " (name may be ambiguous)" : ""}
                </>
              }
            />
            {news.items && news.items.length > 0 ? (
              <Expandable count={news.items.length}>
                {news.items.map((a) => (
                  <ItemLink
                    key={a.url}
                    href={a.url}
                    title={a.title}
                    hint="Open this article in a new tab"
                    meta={
                      [a.source, relativeAge(a.at)]
                        .filter(Boolean)
                        .join(" · ") || null
                    }
                  />
                ))}
              </Expandable>
            ) : news.latestTitle && news.latestUrl ? (
              <ItemLink
                href={news.latestUrl}
                title={news.latestTitle}
                hint="Open this article in a new tab"
                meta={relativeAge(news.latestAt)}
              />
            ) : null}
          </div>
        ) : null}

        {hackernews && hackernews.stories > 0 ? (
          <div>
            <SectionHeader
              icon={<Flame className="size-4" />}
              label="Hacker News"
              summary={
                <>
                  {hackernews.stories}{" "}
                  {hackernews.stories === 1 ? "story" : "stories"} · top{" "}
                  {hackernews.points} points
                </>
              }
            />
            {hackernews.items && hackernews.items.length > 0 ? (
              <Expandable count={hackernews.items.length}>
                {hackernews.items.map((h) => (
                  <ItemLink
                    key={h.url}
                    href={h.url}
                    title={h.title}
                    hint="Open the Hacker News discussion in a new tab"
                    lead={
                      h.isLaunch ? (
                        <span className="bg-spice/15 text-spice shrink-0 rounded px-1 text-[10px] font-medium">
                          Launch
                        </span>
                      ) : undefined
                    }
                    meta={`${h.points} points · ${h.comments} comments${
                      relativeAge(h.at) ? ` · ${relativeAge(h.at)}` : ""
                    }`}
                  />
                ))}
              </Expandable>
            ) : hackernews.latestTitle && hackernews.latestUrl ? (
              <ItemLink
                href={hackernews.latestUrl}
                title={hackernews.latestTitle}
                hint="Open the Hacker News discussion in a new tab"
                meta={relativeAge(hackernews.latestAt)}
              />
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
