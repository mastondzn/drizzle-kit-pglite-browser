import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import * as schema from "./schema";

const client = new PGlite("idb://xd");
export const db = drizzle(client, { schema });

// expose db and schema for browser console
(globalThis as any).db = db;
(globalThis as any).schema = schema;

// opt to use top level await, but browser support is more limited
// await migrate(db);
