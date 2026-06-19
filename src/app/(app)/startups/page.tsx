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
    <StartupsExplorer
      initialRows={rows}
      initialTotal={total}
      initialHasMore={hasMore}
      options={options}
    />
  );
}
