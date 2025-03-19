import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  driver: "pglite",
  out: "./src/db/migrations",
  schema: "./src/db/schema.ts",
});
