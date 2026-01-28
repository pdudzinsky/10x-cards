import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    // Environment setup
    environment: "jsdom",

    // Global setup
    globals: true,
    setupFiles: ["./src/test/setup.ts"],

    // Coverage configuration
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json"],
      exclude: ["node_modules/", "src/test/", "**/*.config.*", "**/*.d.ts", "**/types.ts"],
    },

    // Test patterns
    include: ["**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", "dist", ".astro", "e2e"],
  },

  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
