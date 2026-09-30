import { JsonTaskRepository } from "./JsonTaskRepository.js";
import type { ITaskRepository } from "./ITaskRepository.js";

export type PersistenceConfig = {
  driver: string;
  jsonFilePath: string;
};

export const DEFAULT_USER_ID = "default-user";

export function createTaskRepository(config: PersistenceConfig): ITaskRepository {
  if (config.driver === "postgres") {
    throw new Error("Not implemented");
  }
  if (config.driver !== "json") {
    throw new Error(`Unknown persistence driver: ${config.driver}`);
  }
  return new JsonTaskRepository(config.jsonFilePath);
}
