import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { getTrackerEntries, getTrackerStages } from "@/lib/tracker";
import { TrackerBoard } from "./_components/tracker-board";

export const metadata: Metadata = { title: "Tracker" };

export default async function TrackerPage() {
  const user = await requireUser();
  const [entries, stages] = await Promise.all([
    getTrackerEntries(user.id),
    getTrackerStages(user.id),
  ]);

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-bold tracking-tight">Tracker</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        Your private pipeline. Track each startup through your stages, keep
        notes and the email you sent. Visible only to you.
      </p>
      <TrackerBoard entries={entries} stages={stages} />
    </div>
  );
}
