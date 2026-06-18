import "dotenv/config";
import { getDb } from "./index";
import { trackerStages } from "./schema";

/**
 * Seeds the built-in (default) tracker stages — rows with user_id = NULL that
 * every user sees. Re-runnable: skips inserting any default whose label already
 * exists. Run with `pnpm db:seed` after migrating.
 */
const DEFAULT_STAGES = [
  "Applied",
  "Got response",
  "Interview scheduled",
  "Offer",
  "Rejected",
];

async function main() {
  const db = getDb();

  const existing = await db.select().from(trackerStages);
  const existingDefaultLabels = new Set(
    existing.filter((s) => s.userId === null).map((s) => s.label),
  );

  const toInsert = DEFAULT_STAGES.map((label, i) => ({
    label,
    isDefault: true,
    sortOrder: i,
    userId: null,
  })).filter((s) => !existingDefaultLabels.has(s.label));

  if (toInsert.length === 0) {
    console.log("Default tracker stages already seeded. Nothing to do.");
    return;
  }

  await db.insert(trackerStages).values(toInsert);
  console.log(`Seeded ${toInsert.length} default tracker stage(s): ${toInsert
    .map((s) => s.label)
    .join(", ")}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
