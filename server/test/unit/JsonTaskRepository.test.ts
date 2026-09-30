import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { JsonTaskRepository } from "../../src/repositories/JsonTaskRepository.js";
import { TaskStatus, type Task } from "../../src/domain/task.js";

function task(overrides: Partial<Task> = {}): Task {
  return {
    id: "a",
    userId: "default-user",
    title: "Buy milk",
    dueDate: null,
    order: 0,
    status: TaskStatus.Pending,
    deleted: false,
    ...overrides,
  };
}

describe("JsonTaskRepository", () => {
  async function repo() {
    const dir = await mkdtemp(path.join(tmpdir(), "tasks-"));
    const filePath = path.join(dir, "tasks.json");
    return { filePath, repository: new JsonTaskRepository(filePath) };
  }

  it("creates and lists non-deleted tasks for a user in order", async () => {
    const { repository } = await repo();
    await repository.create(task({ id: "1", order: 1, title: "Second" }));
    await repository.create(task({ id: "2", order: 0, title: "First" }));
    await repository.create(task({ id: "3", userId: "other", title: "Nope" }));
    await repository.create(task({ id: "4", deleted: true, title: "Gone" }));

    const listed = await repository.listByUser("default-user");
    expect(listed.map((item) => item.id)).toEqual(["2", "1"]);
  });

  it("soft-deletes a task so it no longer lists", async () => {
    const { repository, filePath } = await repo();
    await repository.create(task({ id: "1" }));
    expect(await repository.softDelete("1")).toBe(true);
    expect(await repository.listByUser("default-user")).toEqual([]);
    const stored = JSON.parse(await readFile(filePath, "utf8")) as { tasks: Task[] };
    expect(stored.tasks[0]?.deleted).toBe(true);
  });

  it("rewrites order and soft-deletes completed tasks", async () => {
    const { repository } = await repo();
    await repository.create(task({ id: "1", order: 0, status: TaskStatus.Completed }));
    await repository.create(task({ id: "2", order: 1, status: TaskStatus.Pending }));
    await repository.replaceOrder("default-user", ["2", "1"]);
    const reordered = await repository.listByUser("default-user");
    expect(reordered.map((item) => item.id)).toEqual(["2", "1"]);
    const deletedCount = await repository.softDeleteCompleted("default-user");
    expect(deletedCount).toBe(1);
    expect((await repository.listByUser("default-user")).map((item) => item.id)).toEqual(["2"]);
  });
});
