export enum TaskStatus {
  Pending = "pending",
  Completed = "completed",
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
