// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
// Default nitro preset based on hosting environment
if (!process.env.NITRO_PRESET) {
  if (process.env.VERCEL) {
    process.env.NITRO_PRESET = "vercel";
  } else if (process.env.NETLIFY) {
    process.env.NITRO_PRESET = "netlify";
  } else {
    process.env.NITRO_PRESET = "node-server";
  }
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
