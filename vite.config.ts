import path from "node:path";
import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import tsConfigPaths from "vite-tsconfig-paths";

// Cloudflare Workers path uses @cloudflare/vite-plugin instead of Nitro.
// Keep Nitro for Netlify / Render / Cloud Run / local node-server.
const isCloudflare =
  process.env["CLOUDFLARE"] === "1" ||
  process.env["NITRO_PRESET"] === "cloudflare" ||
  Boolean(process.env["CF_PAGES"]);

const hostingPreset = process.env["VERCEL"]
  ? "vercel"
  : process.env["NETLIFY"]
    ? "netlify"
    : undefined;

if (!isCloudflare) {
  if (hostingPreset) {
    process.env["NITRO_PRESET"] = hostingPreset;
  } else if (!process.env["NITRO_PRESET"]) {
    process.env["NITRO_PRESET"] = "node-server";
  }
}

export default defineConfig(async () => {
  const plugins = [
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
  ];

  if (isCloudflare) {
    const { cloudflare } = await import("@cloudflare/vite-plugin");
    plugins.push(cloudflare({ viteEnvironment: { name: "ssr" } }));
  } else {
    plugins.push(nitro({ preset: process.env["NITRO_PRESET"] }));
  }

  plugins.push(viteReact());

  return {
    plugins,
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
      host: "0.0.0.0",
      port: 3000,
      allowedHosts: true,
    },
    build: {
      chunkSizeWarningLimit: 1500,
    },
  };
});
