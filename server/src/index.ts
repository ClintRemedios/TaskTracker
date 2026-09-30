import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildApp } from "./app.js";
import { loadRepoEnv } from "./loadEnv.js";

loadRepoEnv();

const port = Number(process.env.PORT ?? 3000);
const persistenceDriver = process.env.PERSISTENCE_DRIVER ?? "json";
const jsonFilePath =
  process.env.TASKS_JSON_PATH ??
  path.join(path.dirname(fileURLToPath(import.meta.url)), "../data/tasks.json");

const app = await buildApp({ jsonFilePath, persistenceDriver });

await app.listen({ port, host: "0.0.0.0" });
console.log(`Task Tracker API listening on http://localhost:${port}`);
