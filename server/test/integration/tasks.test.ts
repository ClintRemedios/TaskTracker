import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildApp } from "../../src/app.js";
import { TaskStatus } from "../../src/domain/task.js";

async function appWithStore() {
  const dir = await mkdtemp(path.join(tmpdir(), "api-"));
  const jsonFilePath = path.join(dir, "tasks.json");
  const app = await buildApp({ jsonFilePath, persistenceDriver: "json" });
  return app;
}

describe("tasks API", () => {
  it("creates and lists tasks", async () => {
    const app = await appWithStore();
    const empty = await app.inject({ method: "GET", url: "/api/tasks" });
    expect(empty.statusCode).toBe(200);
    expect(empty.json()).toEqual([]);

    const bad = await app.inject({
      method: "POST",
      url: "/api/tasks",
      payload: { title: "", dueDate: null },
    });
    expect(bad.statusCode).toBe(400);

    const created = await app.inject({
      method: "POST",
      url: "/api/tasks",
      payload: { title: "First", dueDate: "2026-10-01" },
    });
    expect(created.statusCode).toBe(200);
    expect(created.json()).toMatchObject({
      title: "First",
      dueDate: "2026-10-01",
      status: TaskStatus.Pending,
      deleted: false,
      order: 0,
      userId: "default-user",
    });

    const list = await app.inject({ method: "GET", url: "/api/tasks" });
    expect(list.json()).toHaveLength(1);
    await app.close();
  });

  it("completes, reorders, cleans, and deletes tasks", async () => {
    const app = await appWithStore();
    const first = (
      await app.inject({
        method: "POST",
        url: "/api/tasks",
        payload: { title: "A", dueDate: null },
      })
    ).json();
    const second = (
      await app.inject({
        method: "POST",
        url: "/api/tasks",
        payload: { title: "B", dueDate: null },
      })
    ).json();

    const patched = await app.inject({
      method: "PATCH",
      url: `/api/tasks/${first.id}`,
      payload: { status: TaskStatus.Completed },
    });
    expect(patched.statusCode).toBe(200);
    expect(patched.json().status).toBe(TaskStatus.Completed);

    const missing = await app.inject({
      method: "PATCH",
      url: "/api/tasks/missing",
      payload: { status: TaskStatus.Completed },
    });
    expect(missing.statusCode).toBe(404);

    const reordered = await app.inject({
      method: "PATCH",
      url: "/api/tasks/reorder",
      payload: { orderedIds: [second.id, first.id] },
    });
    expect(reordered.statusCode).toBe(200);
    expect(reordered.json().map((task: { id: string }) => task.id)).toEqual([second.id, first.id]);

    const cleaned = await app.inject({ method: "POST", url: "/api/tasks/clean-completed" });
    expect(cleaned.json()).toEqual({ deletedCount: 1 });
    const afterClean = await app.inject({ method: "GET", url: "/api/tasks" });
    expect(afterClean.json()).toHaveLength(1);
    expect(afterClean.json()[0].id).toBe(second.id);

    const deleted = await app.inject({ method: "DELETE", url: `/api/tasks/${second.id}` });
    expect(deleted.statusCode).toBe(204);
    const gone = await app.inject({ method: "DELETE", url: `/api/tasks/${second.id}` });
    expect(gone.statusCode).toBe(404);
    const finalList = await app.inject({ method: "GET", url: "/api/tasks" });
    expect(finalList.json()).toEqual([]);
    await app.close();
  });
});
