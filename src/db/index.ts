import { drizzle } from "drizzle-orm/pglite";
import * as schema from "./schema";
import * as expressions from "drizzle-orm/expressions";
import { sql } from "drizzle-orm/sql";

export const db = drizzle("idb://xd", { schema });
// opt to use top level await, but browser support is more limited
// await migrate(db);

// expose db and schema for browser console
(globalThis as any).db = db;
(globalThis as any).schema = schema;
(globalThis as any).sql = sql;
for (const [key, value] of Object.entries(expressions)) {
  (globalThis as any)[key] = value;
}

export { schema };
