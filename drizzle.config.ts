import { resolve } from "node:path";
import { config as loadEnv } from "dotenv";
import { defineConfig } from "drizzle-kit";

// drizzle-kit does not load Next.js env files automatically
loadEnv({ path: resolve(process.cwd(), ".env") });
loadEnv({ path: resolve(process.cwd(), ".env.local"), override: true });

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  // migrate connects here; generate only needs schema — set DATABASE_URL for migrate (e.g. .env.local or Railway).
  dbCredentials: { url: process.env.DATABASE_URL ?? "" },
});
