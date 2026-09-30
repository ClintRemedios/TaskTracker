import { describe, expect, it, vi } from "vitest";
import { TaskStatus, type Task } from "../../src/domain/task.js";
import { NotFoundError, ValidationError } from "../../src/errors.js";
import type { ITaskRepository } from "../../src/repositories/ITaskRepository.js";
import { TaskService } from "../../src/services/TaskService.js";

function task(overrides: Partial<Task> = {}): Task {
  return {
    id: "t1",
    userId: "default-user",
    title: "Write tests",
    dueDate: null,
    order: 0,
    status: TaskStatus.Pending,
    deleted: false,
    ...overrides,
  };
}

function mockRepo(overrides: Partial<ITaskRepository> = {}): ITaskRepository {
  return {
    listByUser: vi.fn(async () => []),
    create: vi.fn(async (item) => item),
    getById: vi.fn(async () => null),
    update: vi.fn(async (item) => item),
    softDelete: vi.fn(async () => true),
    replaceOrder: vi.fn(async () => undefined),
    softDeleteCompleted: vi.fn(async () => 0),
    ...overrides,
  };
}

describe("TaskService", () => {
  it("rejects empty titles and appends order", async () => {
    const repository = mockRepo({
      listByUser: vi.fn(async () => [task({ order: 3 })]),
    });
    const service = new TaskService(repository);
    await expect(service.create({ title: "  ", dueDate: null })).rejects.toBeInstanceOf(
      ValidationError,
    );
    const created = await service.create({ title: " Ship it ", dueDate: "2026-09-30" });
    expect(created.title).toBe("Ship it");
    expect(created.order).toBe(4);
    expect(created.status).toBe(TaskStatus.Pending);
    expect(repository.create).toHaveBeenCalled();
  });

  it("updates status and 404s for deleted tasks", async () => {
    const repository = mockRepo({
      getById: vi.fn(async (id: string) => {
        if (id === "gone") {
          return task({ id: "gone", deleted: true });
        }
        return task({ id });
      }),
    });
    const service = new TaskService(repository);
    await expect(service.updateStatus("gone", TaskStatus.Completed)).rejects.toBeInstanceOf(
      NotFoundError,
    );
    const updated = await service.updateStatus("t1", TaskStatus.Completed);
    expect(updated.status).toBe(TaskStatus.Completed);
  });

  it("rejects reorder payloads that are not the current id set", async () => {
    const repository = mockRepo({
      listByUser: vi.fn(async () => [task({ id: "a" }), task({ id: "b", order: 1 })]),
    });
    const service = new TaskService(repository);
    await expect(service.reorder(["a"])).rejects.toBeInstanceOf(ValidationError);
    await service.reorder(["b", "a"]);
    expect(repository.replaceOrder).toHaveBeenCalledWith("default-user", ["b", "a"]);
  });
});
