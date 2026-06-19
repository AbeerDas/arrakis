import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { requireEnv } from "@/lib/env";

let admin: SupabaseClient | undefined;

/**
 * Service-role Supabase client for privileged server-side operations (e.g.
 * Storage uploads that bypass bucket RLS). Never import into client code.
 * Lazily created so the app builds without the key present.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (!admin) {
    admin = createClient(
      requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
      requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
  }
  return admin;
}
