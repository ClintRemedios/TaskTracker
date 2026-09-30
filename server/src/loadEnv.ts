import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

function repoEnvPath(): string {
  return path.join(path.dirname(fileURLToPath(import.meta.url)), "../../env/server/local.env.json");
}

export function loadRepoEnv(filePath = repoEnvPath()): void {
  let raw: string;
  try {
    raw = readFileSync(filePath, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return;
    }
    throw error;
  }

  const parsed = JSON.parse(raw) as unknown;
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Env file must be a JSON object");
  }

  for (const [key, value] of Object.entries(parsed)) {
    if (process.env[key] !== undefined) {
      continue;
    }
    if (value === null || value === undefined) {
      continue;
    }
    process.env[key] = typeof value === "string" ? value : JSON.stringify(value);
  }
}
