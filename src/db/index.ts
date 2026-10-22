import { createClient, type Client } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const url = process.env.TURSO_DATABASE_URL ?? "file:./local.db";
const authToken = process.env.TURSO_AUTH_TOKEN;

const MAX_FETCH_ATTEMPTS = 5;

async function resilientFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 0; attempt < MAX_FETCH_ATTEMPTS; attempt += 1) {
    const attemptInput = input instanceof Request ? input.clone() : input;
    try {
      return await fetch(attemptInput, init);
    } catch (error) {
      lastError = error;
      if (attempt === MAX_FETCH_ATTEMPTS - 1) break;
      await new Promise((resolve) => setTimeout(resolve, 500 * 2 ** attempt));
    }
  }
  throw lastError;
}

const globalForDb = globalThis as unknown as {
  __tursoClient?: Client;
  __db?: ReturnType<typeof drizzle<typeof schema>>;
};

const client =
  globalForDb.__tursoClient ??
  createClient({ url, authToken, fetch: resilientFetch });
if (process.env.NODE_ENV !== "production") globalForDb.__tursoClient = client;

export const db = globalForDb.__db ?? drizzle(client, { schema });
if (process.env.NODE_ENV !== "production") globalForDb.__db = db;

export { schema };
