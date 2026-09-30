import { randomUUID } from "node:crypto";
import { isTaskStatus, TaskStatus, type Task } from "../domain/task.js";
import { NotFoundError, ValidationError } from "../errors.js";
import { DEFAULT_USER_ID } from "../repositories/createTaskRepository.js";
import type { ITaskRepository } from "../repositories/ITaskRepository.js";

export type CreateTaskInput = {
  title: string;
  dueDate: string | null;
};

export class TaskService {
  constructor(private readonly tasks: ITaskRepository) {}

  list(userId = DEFAULT_USER_ID): Promise<Task[]> {
    return this.tasks.listByUser(userId);
  }

  async create(input: CreateTaskInput, userId = DEFAULT_USER_ID): Promise<Task> {
    if (!input || typeof input.title !== "string") {
      throw new ValidationError("title is required");
    }
    const title = input.title.trim();
    if (!title) {
      throw new ValidationError("title is required");
    }
    const dueDate = normalizeDueDate(input.dueDate);
    const existing = await this.tasks.listByUser(userId);
    const order = existing.length === 0 ? 0 : Math.max(...existing.map((task) => task.order)) + 1;
    const task: Task = {
      id: randomUUID(),
      userId,
      title,
      dueDate,
      order,
      status: TaskStatus.Pending,
      deleted: false,
    };
    return this.tasks.create(task);
  }

  async updateStatus(id: string, status: TaskStatus): Promise<Task> {
    if (!isTaskStatus(status)) {
      throw new ValidationError("status must be pending or completed");
    }
    const task = await this.requireVisible(id);
    const updated = { ...task, status };
    return this.tasks.update(updated);
  }

  async delete(id: string): Promise<void> {
    await this.requireVisible(id);
    const deleted = await this.tasks.softDelete(id);
    if (!deleted) {
      throw new NotFoundError("Task not found");
    }
  }

  async reorder(orderedIds: string[], userId = DEFAULT_USER_ID): Promise<Task[]> {
    if (!Array.isArray(orderedIds) || orderedIds.some((value) => typeof value !== "string")) {
      throw new ValidationError("orderedIds must be an array of strings");
    }
    const current = await this.tasks.listByUser(userId);
    const currentIds = current.map((task) => task.id);
    if (!sameIds(currentIds, orderedIds)) {
      throw new ValidationError("orderedIds must match the current task list");
    }
    await this.tasks.replaceOrder(userId, orderedIds);
    return this.tasks.listByUser(userId);
  }

  async cleanCompleted(userId = DEFAULT_USER_ID): Promise<{ deletedCount: number }> {
    const deletedCount = await this.tasks.softDeleteCompleted(userId);
    return { deletedCount };
  }

  private async requireVisible(id: string): Promise<Task> {
    const task = await this.tasks.getById(id);
    if (!task || task.deleted) {
      throw new NotFoundError("Task not found");
    }
    return task;
  }
}

function sameIds(current: string[], ordered: string[]): boolean {
  if (current.length !== ordered.length) {
    return false;
  }
  const remaining = new Map<string, number>();
  for (const id of current) {
    remaining.set(id, (remaining.get(id) ?? 0) + 1);
  }
  for (const id of ordered) {
    const count = remaining.get(id);
    if (!count) {
      return false;
    }
    remaining.set(id, count - 1);
  }
  return true;
}

function normalizeDueDate(dueDate: string | null | undefined): string | null {
  if (dueDate === null || dueDate === undefined || dueDate === "") {
    return null;
  }
  if (typeof dueDate !== "string") {
    throw new ValidationError("dueDate must be a string or null");
  }
  return dueDate;
}
