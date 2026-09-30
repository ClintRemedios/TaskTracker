export enum TaskStatus {
  Pending = "pending",
  Completed = "completed",
}

export function isTaskStatus(value: unknown): value is TaskStatus {
  return typeof value === "string" && (Object.values(TaskStatus) as string[]).includes(value);
}

export type Task = {
  id: string;
  userId: string;
  title: string;
  dueDate: string | null;
  order: number;
  status: TaskStatus;
  deleted: boolean;
};
