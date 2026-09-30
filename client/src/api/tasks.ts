import { type Task, type TaskStatus } from "../types/task";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (init?.body) {
    headers.set("Content-Type", "application/json");
  }
  const response = await fetch(url, {
    ...init,
    headers,
  });
  if (response.status === 204) {
    return undefined as T;
  }
  const data = (await response.json()) as { message?: string };
  if (!response.ok) {
    throw new Error(data.message ?? "Request failed");
  }
  return data as T;
}

export function listTasks(): Promise<Task[]> {
  return request<Task[]>("/api/tasks");
}

export function createTask(input: { title: string; dueDate: string | null }): Promise<Task> {
  return request<Task>("/api/tasks", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateTaskStatus(id: string, status: TaskStatus): Promise<Task> {
  return request<Task>(`/api/tasks/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function deleteTask(id: string): Promise<void> {
  return request<void>(`/api/tasks/${id}`, { method: "DELETE" });
}

export function reorderTasks(orderedIds: string[]): Promise<Task[]> {
  return request<Task[]>("/api/tasks/reorder", {
    method: "PATCH",
    body: JSON.stringify({ orderedIds }),
  });
}

export function cleanCompleted(): Promise<{ deletedCount: number }> {
  return request<{ deletedCount: number }>("/api/tasks/clean-completed", {
    method: "POST",
  });
}
