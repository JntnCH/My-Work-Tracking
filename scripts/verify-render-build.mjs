import { access, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = resolve(projectRoot, ".output");
const entry = resolve(outputRoot, "server/index.mjs");
const nitroManifest = resolve(outputRoot, "nitro.json");

async function assertFile(filePath, label) {
  try {
    const fileStats = await stat(filePath);
    if (!fileStats.isFile() || fileStats.size === 0) {
      throw new Error(`${label} is empty or not a regular file`);
    }
  } catch (error) {
    throw new Error(`Render build artifact missing: ${label} (${filePath})`, {
      cause: error,
    });
  }
}

await assertFile(entry, "Nitro server entry");
await assertFile(nitroManifest, "Nitro manifest");

try {
  await access(resolve(outputRoot, "public"));
} catch (error) {
  throw new Error(`Render public output missing: ${resolve(outputRoot, "public")}`, {
    cause: error,
  });
}

console.log(`[render-build] projectRoot=${projectRoot}`);
console.log(`[render-build] nitroEntry=${entry}`);
console.log(`[render-build] nitroManifest=${nitroManifest}`);
console.log("[render-build] production artifacts verified");
