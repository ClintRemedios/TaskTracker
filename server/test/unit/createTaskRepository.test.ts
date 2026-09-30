import { describe, expect, it } from "vitest";
import { createTaskRepository } from "../../src/repositories/createTaskRepository.js";
import { JsonTaskRepository } from "../../src/repositories/JsonTaskRepository.js";

describe("createTaskRepository", () => {
  it("throws for postgres until that adapter exists", () => {
    expect(() =>
      createTaskRepository({ driver: "postgres", jsonFilePath: "/tmp/tasks.json" }),
    ).toThrow(/not implemented/i);
  });

  it("throws for unknown drivers", () => {
    expect(() =>
      createTaskRepository({ driver: "mysql", jsonFilePath: "/tmp/tasks.json" }),
    ).toThrow(/unknown persistence driver/i);
  });

  it("returns the JSON adapter for json", () => {
    const repository = createTaskRepository({ driver: "json", jsonFilePath: "/tmp/tasks.json" });
    expect(repository).toBeInstanceOf(JsonTaskRepository);
  });
});
