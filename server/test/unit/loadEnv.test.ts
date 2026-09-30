import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { loadRepoEnv } from "../../src/loadEnv.js";

describe("loadRepoEnv", () => {
  const previous = process.env.PERSISTENCE_DRIVER;

  afterEach(() => {
    if (previous === undefined) {
      delete process.env.PERSISTENCE_DRIVER;
    } else {
      process.env.PERSISTENCE_DRIVER = previous;
    }
  });

  it("sets PERSISTENCE_DRIVER from the JSON env file when unset", async () => {
    delete process.env.PERSISTENCE_DRIVER;
    const dir = await mkdtemp(path.join(tmpdir(), "env-"));
    const filePath = path.join(dir, "local.env.json");
    await writeFile(filePath, JSON.stringify({ PERSISTENCE_DRIVER: "json" }), "utf8");
    loadRepoEnv(filePath);
    expect(process.env.PERSISTENCE_DRIVER).toBe("json");
  });

  it("does not overwrite an existing process env value", async () => {
    process.env.PERSISTENCE_DRIVER = "postgres";
    const dir = await mkdtemp(path.join(tmpdir(), "env-"));
    const filePath = path.join(dir, "local.env.json");
    await writeFile(filePath, JSON.stringify({ PERSISTENCE_DRIVER: "json" }), "utf8");
    loadRepoEnv(filePath);
    expect(process.env.PERSISTENCE_DRIVER).toBe("postgres");
  });
});
