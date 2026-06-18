/**
 * Centralized environment access.
 *
 * Reads are intentionally lazy (call-time, not import-time) so the app can be
 * built and the marketing/blog pages can render before Supabase / Stripe /
 * OpenRouter are provisioned. A missing variable only throws when the feature
 * that needs it is actually exercised.
 */

/** Throw a clear error if a required server-side env var is missing. */
export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
        `See .env.example and set it in your local .env / Vercel project settings.`,
    );
  }
  return value;
}

/** Read an optional env var, returning undefined if unset. */
export function optionalEnv(name: string): string | undefined {
  return process.env[name] || undefined;
}

/** True when the core Supabase config is present (used to no-op gracefully). */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

/** The email address that is auto-granted admin rights on signup. */
export function adminEmail(): string | undefined {
  return process.env.ADMIN_EMAIL?.toLowerCase();
}

/** OpenRouter model slug for the email generator (overridable via env). */
export const OPENROUTER_DEFAULT_MODEL = "anthropic/claude-sonnet-4.6";
