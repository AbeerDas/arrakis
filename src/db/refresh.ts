import "dotenv/config";
import { refreshYcStartups } from "@/lib/yc";

/**
 * Manually run the yc-oss refresh against your database. Same logic the nightly
 * Vercel Cron route uses. Run with `pnpm db:refresh`.
 */
async function main() {
  console.log("Fetching yc-oss companies and upserting…");
  const { fetched, processed } = await refreshYcStartups();
  console.log(`Done. Fetched ${fetched}, upserted ${processed}.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Refresh failed:", err);
    process.exit(1);
  });
