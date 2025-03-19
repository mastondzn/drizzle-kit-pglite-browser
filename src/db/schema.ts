import { text, pgTable } from "drizzle-orm/pg-core";

export const kv = pgTable("kv", {
  key: text().primaryKey(),
  value: text().notNull(),
});
