import { access } from "node:fs/promises";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const entry = resolve(projectRoot, ".output/server/index.mjs");

try {
  await access(entry);
} catch (error) {
  console.error(`[render-start] Nitro server entry was not found: ${entry}`);
  console.error(
    "[render-start] Run the production build from the project root before starting the service.",
  );
  console.error(error);
  process.exit(1);
}

const child = spawn(process.execPath, [entry], {
  cwd: projectRoot,
  env: {
    ...process.env,
    HOST: process.env.HOST ?? "0.0.0.0",
  },
  stdio: "inherit",
});

child.on("error", (error) => {
  console.error("[render-start] Failed to start Nitro server", error);
  process.exitCode = 1;
});

const exitCode = await new Promise((resolveExit) => {
  child.once("exit", (code, signal) => {
    if (signal) {
      console.error(`[render-start] Nitro server exited from signal ${signal}`);
      resolveExit(1);
      return;
    }
    resolveExit(code ?? 1);
  });
});

process.exitCode = exitCode;
