// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
// Select the deployment-specific Nitro preset before the TanStack Start config is loaded.
// Vercel/Netlify may retain a stale NITRO_PRESET project variable, so the hosting
// provider must take precedence over that value. Other hosts still honor an
// explicitly supplied preset and fall back to the Node server preset locally.
const hostingPreset = process.env.VERCEL ? "vercel" : process.env.NETLIFY ? "netlify" : undefined;

if (hostingPreset) {
  process.env.NITRO_PRESET = hostingPreset;
} else if (!process.env.NITRO_PRESET) {
  process.env.NITRO_PRESET = "node-server";
}

import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: {
    server: { allowedHosts: true },
    build: {
      chunkSizeWarningLimit: 1500,
    },
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
