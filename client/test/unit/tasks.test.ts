import { afterEach, describe, expect, it, vi } from "vitest";
import {
  cleanCompleted,
  createTask,
  deleteTask,
  listTasks,
  reorderTasks,
  updateTaskStatus,
} from "../../src/api/tasks";
import { TaskStatus } from "../../src/types/task";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("tasks API", () => {
  const fetchMock = vi.fn();

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends JSON for each task route and returns the payload", async () => {
    vi.stubGlobal("fetch", fetchMock);
    const task = {
      id: "1",
      userId: "default-user",
      title: "Buy milk",
      dueDate: null,
      order: 0,
      status: TaskStatus.Pending,
      deleted: false,
    };
    fetchMock.mockResolvedValueOnce(jsonResponse([task]));
    await expect(listTasks()).resolves.toEqual([task]);

    fetchMock.mockResolvedValueOnce(jsonResponse(task));
    await createTask({ title: "Buy milk", dueDate: null });

    fetchMock.mockResolvedValueOnce(jsonResponse({ ...task, status: TaskStatus.Completed }));
    await updateTaskStatus("1", TaskStatus.Completed);

    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));
    await expect(deleteTask("1")).resolves.toBeUndefined();

    fetchMock.mockResolvedValueOnce(jsonResponse([task]));
    await reorderTasks(["1"]);

    fetchMock.mockResolvedValueOnce(jsonResponse({ deletedCount: 2 }));
    await expect(cleanCompleted()).resolves.toEqual({ deletedCount: 2 });

    const createCall = fetchMock.mock.calls[1];
    expect(createCall[0]).toBe("/api/tasks");
    expect(createCall[1].method).toBe("POST");
    expect(new Headers(createCall[1].headers).get("Content-Type")).toBe("application/json");
    const listCall = fetchMock.mock.calls[0];
    expect(new Headers(listCall[1].headers).get("Content-Type")).toBeNull();
  });

  it("throws the server message, or a fallback when the body has none", async () => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockResolvedValueOnce(jsonResponse({ message: "nope" }, 400));
    await expect(listTasks()).rejects.toThrow("nope");

    fetchMock.mockResolvedValueOnce(jsonResponse({}, 500));
    await expect(listTasks()).rejects.toThrow("Request failed");
  });
});
