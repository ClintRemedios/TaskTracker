import type { Task } from "../domain/task.js";

export interface ITaskRepository {
  listByUser(userId: string): Promise<Task[]>;
  create(task: Task): Promise<Task>;
  getById(id: string): Promise<Task | null>;
  update(task: Task): Promise<Task>;
  softDelete(id: string): Promise<boolean>;
  replaceOrder(userId: string, orderedIds: string[]): Promise<void>;
  softDeleteCompleted(userId: string): Promise<number>;
}
