import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export { schema };

let client: ReturnType<typeof postgres> | undefined;
let dbInstance: ReturnType<typeof drizzle<typeof schema>> | undefined;

/**
 * Lazily create the Drizzle client.
 *
 * Instantiation is deferred to first use (rather than module load) so the app
 * can build and serve the marketing/blog pages before a database exists.
 *
 * Uses the pooled `DATABASE_URL` (Supabase transaction pooler) with
 * `prepare: false`, which is required when running through PgBouncer.
 */
export function getDb() {
  if (!dbInstance) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error(
        "DATABASE_URL is not set. Add it from your Supabase project settings (see .env.example).",
      );
    }
    client = postgres(connectionString, { prepare: false });
    dbInstance = drizzle(client, { schema });
  }
  return dbInstance;
}
