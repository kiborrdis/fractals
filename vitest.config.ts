import { defineConfig } from "vitest/config";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "src");

export default defineConfig({
  resolve: {
    alias: {
      "@/shared": resolve(root, "shared"),
      "@/features": resolve(root, "features"),
      "@/pages": resolve(root, "pages"),
    },
  },
  test: {
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
  },
});
