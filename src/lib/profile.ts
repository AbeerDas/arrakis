import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { profiles, type Profile } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { adminEmail } from "@/lib/env";

/**
 * Ensure a `profiles` row exists for the current user and return it.
 *
 * Called from the authenticated app shell, so a profile is guaranteed to exist
 * lazily on first app load (no DB trigger required). Auto-grants admin when the
 * user's email matches ADMIN_EMAIL.
 *
 * Note: intentionally does NOT touch `last_active_at` — the "new since last
 * visit" feature owns that field so it can read the prior value before updating.
 */
export async function syncProfile(): Promise<Profile | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const db = getDb();
  const email = user.email ?? "";
  const configuredAdmin = adminEmail();
  const isAdminEmail = Boolean(
    configuredAdmin && email.toLowerCase() === configuredAdmin,
  );

  await db
    .insert(profiles)
    .values({ id: user.id, email, isAdmin: isAdminEmail })
    .onConflictDoUpdate({
      target: profiles.id,
      set: {
        email,
        // Only ever escalate to admin here; never silently demote.
        ...(isAdminEmail ? { isAdmin: true } : {}),
      },
    });

  const rows = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1);
  return rows[0] ?? null;
}
