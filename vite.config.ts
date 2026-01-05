import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import generateDocsPlugin from "./vite-plugins/generate-docs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "src");

export default defineConfig({
  plugins: [
    generateDocsPlugin(),
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
      routesDirectory: "./src/app/routes",
      generatedRouteTree: "./src/app/routeTree.gen.ts",
      routeFileIgnorePrefix: "-",
      quoteStyle: "double",
    }),
    react(),
  ],
  resolve: {
    alias: {
      "@/shared": resolve(root, "shared"),
      "@/features": resolve(root, "features"),
      "@/pages": resolve(root, "pages"),
    },
  },
});
