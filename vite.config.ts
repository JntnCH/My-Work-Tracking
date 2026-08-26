import path from "node:path";
import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import tsConfigPaths from "vite-tsconfig-paths";

// Select the deployment-specific Nitro preset before the config is evaluated.
// Hosting providers take precedence over a stale project-level NITRO_PRESET.
const hostingPreset = process.env["VERCEL"]
  ? "vercel"
  : process.env["NETLIFY"]
    ? "netlify"
    : undefined;

if (hostingPreset) {
  process.env["NITRO_PRESET"] = hostingPreset;
} else if (!process.env["NITRO_PRESET"]) {
  process.env["NITRO_PRESET"] = "node-server";
}

export default defineConfig({
  plugins: [
    tailwindcss(),
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tanstackStart({
      importProtection: {
        behavior: "error",
        client: {
          files: ["**/server/**"],
          specifiers: ["server-only"],
        },
      },
      // Redirect TanStack Start's bundled server entry to src/server.ts.
      server: { entry: "server" },
    }),
    nitro({ preset: process.env["NITRO_PRESET"] }),
    viteReact(),
  ],
  css: { transformer: "lightningcss" },
  resolve: {
    alias: { "@": path.resolve(process.cwd(), "src") },
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "@tanstack/react-query",
      "@tanstack/query-core",
    ],
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-dom/client",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
    ],
    ignoreOutdatedRequests: true,
  },
  server: {
    host: "::",
    port: 8080,
  },
  build: {
    chunkSizeWarningLimit: 1500,
  },
});
