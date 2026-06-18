import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/env";

export const dynamic = "force-dynamic";

/** Lightweight readiness probe — handy for verifying a deploy + env wiring. */
export function GET() {
  return NextResponse.json({
    ok: true,
    service: "arrakis",
    time: new Date().toISOString(),
    configured: {
      supabase: isSupabaseConfigured(),
      database: Boolean(process.env.DATABASE_URL),
      stripe: Boolean(process.env.STRIPE_SECRET_KEY),
      openrouter: Boolean(process.env.OPENROUTER_API_KEY),
    },
  });
}
