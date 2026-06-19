"use server";

import { revalidatePath } from "next/cache";
import { and, asc, eq, ilike, isNull, notInArray, or } from "drizzle-orm";
import { getDb } from "@/db";
import {
  startups,
  trackerEntries,
  trackerEntryStages,
  trackerStages,
} from "@/db/schema";
import { requireUser } from "@/lib/auth";
import {
  getTrackerStages,
  userOwnsEntry,
  type TrackerEntryRow,
  type TrackerStageRow,
} from "@/lib/tracker";

export type AddResult =
  | { ok: true; entry: TrackerEntryRow }
  | { ok: false; reason: "duplicate" | "not-found" };

/** Add a startup to the user's tracker. Idempotent on (user, startup). */
export async function addToTracker(startupId: string): Promise<AddResult> {
  const user = await requireUser();
  const db = getDb();

  const inserted = await db
    .insert(trackerEntries)
    .values({ userId: user.id, startupId })
    .onConflictDoNothing({
      target: [trackerEntries.userId, trackerEntries.startupId],
    })
    .returning({ id: trackerEntries.id });
  if (!inserted.length) return { ok: false, reason: "duplicate" };

  const rows = await db
    .select({
      name: startups.name,
      oneLiner: startups.oneLiner,
      website: startups.website,
      batch: startups.batch,
      logoUrl: startups.logoUrl,
    })
    .from(startups)
    .where(eq(startups.id, startupId))
    .limit(1);
  const info = rows[0];
  if (!info) return { ok: false, reason: "not-found" };

  revalidatePath("/tracker");
  return {
    ok: true,
    entry: {
      id: inserted[0].id,
      startupId,
      name: info.name,
      oneLiner: info.oneLiner,
      website: info.website,
      batch: info.batch,
      logoUrl: info.logoUrl,
      notes: null,
      sentEmailBody: null,
      stageIds: [],
    },
  };
}

export async function removeFromTracker(entryId: string): Promise<void> {
  const user = await requireUser();
  const db = getDb();
  await db
    .delete(trackerEntries)
    .where(
      and(eq(trackerEntries.id, entryId), eq(trackerEntries.userId, user.id)),
    );
  revalidatePath("/tracker");
}

/** Check or uncheck a stage on an entry. Both the entry and stage are authz'd. */
export async function setStage(
  entryId: string,
  stageId: string,
  checked: boolean,
): Promise<void> {
  const user = await requireUser();
  if (!(await userOwnsEntry(user.id, entryId))) return;

  const db = getDb();
  const stageOk = await db
    .select({ id: trackerStages.id })
    .from(trackerStages)
    .where(
      and(
        eq(trackerStages.id, stageId),
        or(isNull(trackerStages.userId), eq(trackerStages.userId, user.id)),
      ),
    )
    .limit(1);
  if (!stageOk.length) return;

  if (checked) {
    await db
      .insert(trackerEntryStages)
      .values({ trackerEntryId: entryId, stageId })
      .onConflictDoNothing();
  } else {
    await db
      .delete(trackerEntryStages)
      .where(
        and(
          eq(trackerEntryStages.trackerEntryId, entryId),
          eq(trackerEntryStages.stageId, stageId),
        ),
      );
  }
  revalidatePath("/tracker");
}

export async function updateNotes(
  entryId: string,
  notes: string,
): Promise<void> {
  const user = await requireUser();
  const db = getDb();
  await db
    .update(trackerEntries)
    .set({ notes: notes.trim() || null, updatedAt: new Date() })
    .where(
      and(eq(trackerEntries.id, entryId), eq(trackerEntries.userId, user.id)),
    );
  revalidatePath("/tracker");
}

/** Save the sent-email body. Write-only: stored for the owner, never read back by admin. */
export async function updateSentEmail(
  entryId: string,
  body: string,
): Promise<void> {
  const user = await requireUser();
  const db = getDb();
  await db
    .update(trackerEntries)
    .set({ sentEmailBody: body.trim() || null, updatedAt: new Date() })
    .where(
      and(eq(trackerEntries.id, entryId), eq(trackerEntries.userId, user.id)),
    );
  revalidatePath("/tracker");
}

export type AddStageResult =
  | { ok: true; stage: TrackerStageRow }
  | { ok: false; message: string };

export async function addCustomStage(label: string): Promise<AddStageResult> {
  const user = await requireUser();
  const clean = label.trim();
  if (!clean) return { ok: false, message: "Enter a stage name." };
  if (clean.length > 40)
    return { ok: false, message: "Keep it under 40 characters." };

  const db = getDb();
  const existing = await getTrackerStages(user.id);
  if (existing.some((s) => s.label.toLowerCase() === clean.toLowerCase())) {
    return { ok: false, message: "That stage already exists." };
  }
  const sortOrder = existing.reduce((m, s) => Math.max(m, s.sortOrder), 0) + 1;

  const inserted = await db
    .insert(trackerStages)
    .values({ userId: user.id, label: clean, isDefault: false, sortOrder })
    .returning({
      id: trackerStages.id,
      label: trackerStages.label,
      isDefault: trackerStages.isDefault,
      sortOrder: trackerStages.sortOrder,
    });
  revalidatePath("/tracker");
  return { ok: true, stage: inserted[0] };
}

/** Delete one of the user's own custom stages (defaults are untouchable). */
export async function removeCustomStage(stageId: string): Promise<void> {
  const user = await requireUser();
  const db = getDb();
  await db
    .delete(trackerStages)
    .where(
      and(eq(trackerStages.id, stageId), eq(trackerStages.userId, user.id)),
    );
  revalidatePath("/tracker");
}

/** Typeahead for the "add startups" box: name matches not already tracked. */
export async function searchStartupsToAdd(
  q: string,
): Promise<{ id: string; name: string; batch: string | null }[]> {
  const user = await requireUser();
  const clean = q.trim();
  if (clean.length < 2) return [];
  const db = getDb();
  const tracked = db
    .select({ s: trackerEntries.startupId })
    .from(trackerEntries)
    .where(eq(trackerEntries.userId, user.id));
  return db
    .select({ id: startups.id, name: startups.name, batch: startups.batch })
    .from(startups)
    .where(
      and(ilike(startups.name, `%${clean}%`), notInArray(startups.id, tracked)),
    )
    .orderBy(asc(startups.name))
    .limit(8);
}
