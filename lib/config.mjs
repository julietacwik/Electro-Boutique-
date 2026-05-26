import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const LIB_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = resolve(LIB_DIR, "..");
const ENV_PATH = resolve(ROOT_DIR, ".env");

function loadEnvFile() {
  if (!existsSync(ENV_PATH)) {
    return;
  }

  const contents = readFileSync(ENV_PATH, "utf8");
  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvFile();

export const config = {
  rootDir: ROOT_DIR,
  host: process.env.HOST || "127.0.0.1",
  port: Number(process.env.PORT || 3000),
  databasePath: resolve(
    ROOT_DIR,
    process.env.DATABASE_PATH || "./data/electro-boutique.db"
  ),
  sessionSecret: process.env.SESSION_SECRET || "change-this-session-secret",
  sessionTtlDays: Number(process.env.SESSION_TTL_DAYS || 14),
  isProduction: process.env.NODE_ENV === "production"
};
