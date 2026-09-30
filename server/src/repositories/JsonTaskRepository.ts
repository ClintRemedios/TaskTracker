import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { TaskStatus, type Task } from "../domain/task.js";
import type { ITaskRepository } from "./ITaskRepository.js";

type Store = { tasks: Task[] };

export class JsonTaskRepository implements ITaskRepository {
  private chain: Promise<unknown> = Promise.resolve();

  constructor(private readonly filePath: string) {}

  private serialize<T>(work: () => Promise<T>): Promise<T> {
    const next = this.chain.then(work, work);
    this.chain = next.then(
      () => undefined,
      () => undefined,
    );
    return next;
  }

  private async readStore(): Promise<Store> {
    try {
      const raw = await readFile(this.filePath, "utf8");
      const parsed = JSON.parse(raw) as Store;
      return { tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [] };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return { tasks: [] };
      }
      throw error;
    }
  }

  private async writeStore(store: Store): Promise<void> {
    await mkdir(dirname(this.filePath), { recursive: true });
    await writeFile(this.filePath, JSON.stringify(store, null, 2), "utf8");
  }

  listByUser(userId: string): Promise<Task[]> {
    return this.serialize(async () => {
      const store = await this.readStore();
      return store.tasks
        .filter((task) => task.userId === userId && !task.deleted)
        .sort((a, b) => a.order - b.order);
    });
  }

  create(task: Task): Promise<Task> {
    return this.serialize(async () => {
      const store = await this.readStore();
      store.tasks.push(task);
      await this.writeStore(store);
      return task;
    });
  }

  getById(id: string): Promise<Task | null> {
    return this.serialize(async () => {
      const store = await this.readStore();
      return store.tasks.find((task) => task.id === id) ?? null;
    });
  }

  update(task: Task): Promise<Task> {
    return this.serialize(async () => {
      const store = await this.readStore();
      const index = store.tasks.findIndex((item) => item.id === task.id);
      if (index === -1) {
        throw new Error("Task not found");
      }
      store.tasks[index] = task;
      await this.writeStore(store);
      return task;
    });
  }

  softDelete(id: string): Promise<boolean> {
    return this.serialize(async () => {
      const store = await this.readStore();
      const task = store.tasks.find((item) => item.id === id);
      if (!task || task.deleted) {
        return false;
      }
      task.deleted = true;
      await this.writeStore(store);
      return true;
    });
  }

  replaceOrder(userId: string, orderedIds: string[]): Promise<void> {
    return this.serialize(async () => {
      const store = await this.readStore();
      const indexById = new Map(orderedIds.map((id, index) => [id, index]));
      for (const task of store.tasks) {
        if (task.userId !== userId || task.deleted) {
          continue;
        }
        const order = indexById.get(task.id);
        if (order !== undefined) {
          task.order = order;
        }
      }
      await this.writeStore(store);
    });
  }

  softDeleteCompleted(userId: string): Promise<number> {
    return this.serialize(async () => {
      const store = await this.readStore();
      let deletedCount = 0;
      for (const task of store.tasks) {
        if (task.userId === userId && !task.deleted && task.status === TaskStatus.Completed) {
          task.deleted = true;
          deletedCount += 1;
        }
      }
      await this.writeStore(store);
      return deletedCount;
    });
  }
}
