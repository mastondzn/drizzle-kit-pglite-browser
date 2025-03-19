import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import * as schema from "./schema";

const client = new PGlite("idb://xd");
export const db = drizzle(client, { schema });

// opt to use top level await, but browser support is more limited
// await migrate(db);
