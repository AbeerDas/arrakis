import { and, asc, desc, eq, inArray, isNull, or } from "drizzle-orm";
import { getDb } from "@/db";
import {
  startups,
  trackerEntries,
  trackerEntryStages,
  trackerStages,
} from "@/db/schema";

export type TrackerStageRow = {
  id: string;
  label: string;
  isDefault: boolean;
  sortOrder: number;
};

export type TrackerEntryRow = {
  id: string;
  startupId: string;
  name: string;
  oneLiner: string | null;
  website: string | null;
  batch: string | null;
  logoUrl: string | null;
  notes: string | null;
  // Write-only for the owner. Never read by admin tooling or the moat dashboard.
  sentEmailBody: string | null;
  stageIds: string[];
};

/** Stages visible to a user: the shared defaults plus their own custom ones. */
export async function getTrackerStages(
  userId: string,
): Promise<TrackerStageRow[]> {
  const db = getDb();
  const rows = await db
    .select({
      id: trackerStages.id,
      label: trackerStages.label,
      isDefault: trackerStages.isDefault,
      sortOrder: trackerStages.sortOrder,
    })
    .from(trackerStages)
    .where(or(isNull(trackerStages.userId), eq(trackerStages.userId, userId)))
    .orderBy(asc(trackerStages.sortOrder), asc(trackerStages.label));
  return rows;
}

/** The user's tracked startups, newest first, each with its checked stage ids. */
export async function getTrackerEntries(
  userId: string,
): Promise<TrackerEntryRow[]> {
  const db = getDb();
  const entries = await db
    .select({
      id: trackerEntries.id,
      startupId: trackerEntries.startupId,
      notes: trackerEntries.notes,
      sentEmailBody: trackerEntries.sentEmailBody,
      name: startups.name,
      oneLiner: startups.oneLiner,
      website: startups.website,
      batch: startups.batch,
      logoUrl: startups.logoUrl,
    })
    .from(trackerEntries)
    .innerJoin(startups, eq(trackerEntries.startupId, startups.id))
    .where(eq(trackerEntries.userId, userId))
    .orderBy(desc(trackerEntries.createdAt));

  if (entries.length === 0) return [];

  const links = await db
    .select({
      trackerEntryId: trackerEntryStages.trackerEntryId,
      stageId: trackerEntryStages.stageId,
    })
    .from(trackerEntryStages)
    .where(
      inArray(
        trackerEntryStages.trackerEntryId,
        entries.map((e) => e.id),
      ),
    );

  const byEntry = new Map<string, string[]>();
  for (const link of links) {
    const arr = byEntry.get(link.trackerEntryId);
    if (arr) arr.push(link.stageId);
    else byEntry.set(link.trackerEntryId, [link.stageId]);
  }

  return entries.map((e) => ({ ...e, stageIds: byEntry.get(e.id) ?? [] }));
}

/** Startup ids the user already tracks (for the "add to tracker" affordance). */
export async function getTrackedStartupIds(userId: string): Promise<string[]> {
  const db = getDb();
  const rows = await db
    .select({ startupId: trackerEntries.startupId })
    .from(trackerEntries)
    .where(eq(trackerEntries.userId, userId));
  return rows.map((r) => r.startupId);
}

/** Is one entry owned by this user? Used to gate stage/notes writes. */
export async function userOwnsEntry(
  userId: string,
  entryId: string,
): Promise<boolean> {
  const db = getDb();
  const rows = await db
    .select({ id: trackerEntries.id })
    .from(trackerEntries)
    .where(
      and(eq(trackerEntries.id, entryId), eq(trackerEntries.userId, userId)),
    )
    .limit(1);
  return rows.length > 0;
}
