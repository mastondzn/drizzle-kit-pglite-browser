import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  optimizeDeps: {
    exclude: ["@electric-sql/pglite"],
  },
  base: process.env.GITHUB_ACTIONS ? "/drizzle-kit-pglite-browser/" : "/",
  plugins: [tailwindcss()],
});
