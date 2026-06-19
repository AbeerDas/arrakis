import type { Metadata } from "next";
import { getFilterOptions, queryStartups } from "@/lib/startups";
import { StartupsExplorer } from "./_components/startups-explorer";

export const metadata: Metadata = { title: "Startups" };

export default async function StartupsPage() {
  const [{ rows, total, hasMore }, options] = await Promise.all([
    queryStartups({ page: 1 }),
    getFilterOptions(),
  ]);

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="font-serif text-3xl tracking-tight">Startups</h1>
      </div>
      <p className="text-muted-foreground mt-1 text-sm">
        The full YC list, refreshed nightly. Newest first.
      </p>

      <div className="mt-8">
        <StartupsExplorer
          initialRows={rows}
          initialTotal={total}
          initialHasMore={hasMore}
          options={options}
        />
      </div>
    </div>
  );
}
