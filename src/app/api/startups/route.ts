import { type NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { queryStartups } from "@/lib/startups";

export const dynamic = "force-dynamic";

function num(v: string | null): number | undefined {
  if (v === null || v.trim() === "") return undefined;
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? n : undefined;
}

export async function GET(request: NextRequest) {
  // App data — gate behind auth even though it's a same-origin fetch.
  await requireUser();

  const sp = request.nextUrl.searchParams;
  const tags = sp.getAll("tags").filter(Boolean);
  const result = await queryStartups({
    q: sp.get("q") ?? undefined,
    batch: sp.get("batch") ?? undefined,
    industry: sp.get("industry") ?? undefined,
    stage: sp.get("stage") ?? undefined,
    status: sp.get("status") ?? undefined,
    tags: tags.length ? tags : undefined,
    hiring: sp.get("hiring") === "1" || undefined,
    page: num(sp.get("page")) ?? 1,
  });

  return NextResponse.json(result);
}
