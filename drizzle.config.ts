import "dotenv/config";
import { defineConfig } from "drizzle-kit";

// `db:generate` works offline (diffs schema against snapshots, no DB needed).
// `db:migrate` / `db:push` / `db:studio` connect using DIRECT_URL (a direct,
// non-pooled Supabase connection — the transaction pooler used at runtime does
// not support the DDL/session features migrations need).
export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DIRECT_URL || process.env.DATABASE_URL || "",
  },
  verbose: true,
  strict: true,
});
