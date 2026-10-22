import { existsSync } from "node:fs";

for (const file of [".env.local", ".env"]) {
  if (existsSync(file) && typeof process.loadEnvFile === "function") {
    try {
      process.loadEnvFile(file);
    } catch {
      // ignore malformed env files
    }
  }
}

const config = {
  dialect: "sqlite",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL ?? "file:./local.db",
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
  verbose: true,
  strict: true,
};

export default config;
