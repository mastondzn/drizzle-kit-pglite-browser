import type { PgliteDatabase } from "drizzle-orm/pglite";
import type { schema } from "./";
import type { PgDialect, PgSession } from "drizzle-orm/pg-core";

// cache the migration status for the current session
let migrated = false;

/**
 * You should try to migrate before the first query on the database. We do it in the renderKVPairs function.
 * You can opt to use top level await, but browser support is more limited (also needs vite build config edit).
 * We cache the migration status for the current session.
 * Migrator is based on the internal migrator
 * @see https://github.com/drizzle-team/drizzle-orm/blob/main/drizzle-orm/src/pglite/migrator.ts
 * @see https://github.com/drizzle-team/drizzle-orm/blob/main/drizzle-orm/src/migrator.ts#L48
 */
export async function migrate(database: PgliteDatabase<typeof schema>) {
  if (migrated) return;

  const files = import.meta.glob<boolean, string, string>(
    // path should correspond to drizzle.config.ts, we cannot use public folder with dynamic imports
    "./migrations/*.sql",
    { query: "?raw", import: "default" }
  );

  // this path should also correspond to drizzle.config.ts
  const journal = await import("./migrations/meta/_journal.json");

  const migrations = [];

  for (const entry of journal.entries) {
    try {
      // ... and this path
      const migration = await files[`./migrations/${entry.tag}.sql`]!();
      const statements = migration.split("--> statement-breakpoint");

      migrations.push({
        sql: statements,
        bps: entry.breakpoints,
        folderMillis: entry.when,
        hash: await hash(migration),
      });
    } catch (error) {
      console.error(error);
      throw new Error(`Failed to load migration ${entry.tag} from journal.`);
    }
  }

  // PgDialect and PgSession are marked as internal with stripInternal so we patch it
  const db = database as PgliteDatabase<typeof schema> & {
    dialect: PgDialect;
    session: PgSession;
  };

  await db.dialect.migrate(migrations, db.session, "");
  migrated = true;
}

async function hash(message: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
