import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    environment: "node",
    include: ["src/education/__tests__/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["src/education/**/*.ts"],
      exclude: ["src/education/__tests__/**/*.ts", "src/education/docs/**", "src/education/database/**"],
    },
  },
});
