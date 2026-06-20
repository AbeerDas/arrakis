"use server";

import { requireUser } from "@/lib/auth";
import { enrichStartup } from "@/lib/signals/enrich";
import type { StartupSignals } from "@/lib/signals/types";

/**
 * On-demand signals for the startup detail panel. Returns cached data and only
 * hits the network for sources whose snapshot is older than the TTL.
 */
export async function getStartupSignals(
  startupId: string,
): Promise<StartupSignals> {
  await requireUser();
  return enrichStartup(startupId, { force: false });
}
