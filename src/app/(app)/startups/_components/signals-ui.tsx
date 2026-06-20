import { Code2, Flame, Newspaper, Star } from "lucide-react";
import type { StartupSignals } from "@/lib/signals/types";
import { isEmptySignals } from "@/lib/signals/types";
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
        "text-muted-foreground flex items-center gap-2 text-xs",
        className,
      )}
    >
      {github && (github.stars > 0 || github.active) ? (
        <span
          className="flex items-center gap-1"
          title={`GitHub: ${compact(github.stars)} stars${github.active ? ", active" : ""}`}
        >
          <Star className="size-3" />
          {compact(github.stars)}
          {github.active ? (
            <span className="bg-spice ml-0.5 inline-block size-1.5 rounded-full" />
          ) : null}
        </span>
      ) : null}
      {news && news.count > 0 ? (
        <span
          className="flex items-center gap-1"
          title={`${news.count} recent news mentions`}
        >
          <Newspaper className="size-3" />
          {compact(news.count)}
        </span>
      ) : null}
      {hackernews && hackernews.stories > 0 ? (
        <span
          className="flex items-center gap-1"
          title={`Hacker News: ${hackernews.stories} stories, top ${hackernews.points} points`}
        >
          <Flame className="size-3" />
          {compact(hackernews.points)}
        </span>
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

function Row({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="text-muted-foreground mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs font-medium">{label}</p>
        <div className="text-muted-foreground text-xs">{children}</div>
      </div>
    </div>
  );
}

/** The full "Signals" section in the startup detail drawer. */
export function SignalsPanel({
  signals,
  loading,
}: {
  signals: StartupSignals;
  loading: boolean;
}) {
  const { github, hackernews, news } = signals;

  return (
    <div>
      <h3 className="text-muted-foreground text-xs tracking-wide uppercase">
        Signals
      </h3>

      {loading && isEmptySignals(signals) ? (
        <div className="mt-2 space-y-2">
          <div className="bg-muted h-4 w-2/3 animate-pulse rounded" />
          <div className="bg-muted h-4 w-1/2 animate-pulse rounded" />
        </div>
      ) : isEmptySignals(signals) ? (
        <p className="text-muted-foreground mt-1.5 text-sm">
          No public activity signals found.
        </p>
      ) : (
        <div className="mt-3 space-y-3">
          {github ? (
            <Row icon={<Code2 className="size-4" />} label="GitHub">
              {compact(github.stars)} stars
              {github.repoCount ? ` · ${github.repoCount} repos` : ""}
              {github.primaryLanguage ? ` · ${github.primaryLanguage}` : ""}
              {github.active ? (
                <span className="text-spice"> · active</span>
              ) : github.lastPushedAt ? (
                ` · pushed ${relativeAge(github.lastPushedAt)}`
              ) : (
                ""
              )}
            </Row>
          ) : null}

          {news && news.count > 0 ? (
            <Row icon={<Newspaper className="size-4" />} label="In the news">
              {news.count} recent mentions
              {news.confidence === "low" ? " (name may be ambiguous)" : ""}
              {news.latestTitle ? (
                <a
                  href={news.latestUrl ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground mt-0.5 block truncate underline-offset-4 hover:underline"
                  title={news.latestTitle}
                >
                  {news.latestTitle}
                </a>
              ) : null}
            </Row>
          ) : null}

          {hackernews && hackernews.stories > 0 ? (
            <Row icon={<Flame className="size-4" />} label="Hacker News">
              {hackernews.stories} stories · top {hackernews.points} points
              {hackernews.latestTitle ? (
                <a
                  href={hackernews.latestUrl ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground mt-0.5 block truncate underline-offset-4 hover:underline"
                  title={hackernews.latestTitle}
                >
                  {hackernews.latestTitle}
                </a>
              ) : null}
            </Row>
          ) : null}
        </div>
      )}
    </div>
  );
}
