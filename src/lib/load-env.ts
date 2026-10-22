import { existsSync } from "node:fs";

/**
 * Loads .env.local / .env into process.env.
 * Next.js does this for the app itself; scripts (seed, drizzle) need it manually.
 */
export function loadEnv() {
  if (typeof process.loadEnvFile !== "function") return;
  for (const file of [".env.local", ".env"]) {
    if (!existsSync(file)) continue;
    try {
      process.loadEnvFile(file);
    } catch {
      // keep going — a malformed file should not crash the script
    }
  }
}

loadEnv();
