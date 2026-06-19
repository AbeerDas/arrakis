import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/db";
import { profiles, type Profile } from "@/db/schema";

/** The Supabase auth user for the current request, or null. */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** The application profile row for the current user (requires DB), or null. */
export async function getCurrentProfile(): Promise<Profile | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  const rows = await getDb()
    .select()
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1);
  return rows[0] ?? null;
}

/** Redirect to /login unless signed in. Returns the auth user. */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** Redirect to /startups unless the current user is an admin. */
export async function requireAdmin(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile?.isAdmin) redirect("/startups");
  return profile;
}
