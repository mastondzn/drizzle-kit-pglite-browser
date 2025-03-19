import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  optimizeDeps: {
    exclude: ["@electric-sql/pglite"],
  },
  plugins: [tailwindcss()],
});
