import { type NextRequest, NextResponse } from "next/server";
import { refreshYcStartups } from "@/lib/yc";

export const dynamic = "force-dynamic";
// Allow time for the bulk upsert (clamped to your Vercel plan's limit).
export const maxDuration = 60;

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  // Refuse to run as an open endpoint. Vercel Cron sends this header
  // automatically when CRON_SECRET is set in the project.
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { fetched, processed } = await refreshYcStartups();
    return NextResponse.json({ ok: true, fetched, processed });
  } catch (err) {
    const message = err instanceof Error ? err.message : "refresh failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
