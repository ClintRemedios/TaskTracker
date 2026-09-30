# 02: Create and List Tasks

## 1. Goal & Scope

Users can add a task (title, optional due date) and see non-deleted tasks ordered by `order`.

**In scope:** JSON `ITaskRepository`, `TaskService` create/list, `GET/POST /api/tasks`, list + create UI.

**Non-goals:** complete, delete, reorder, clean, auth, Postgres.

## 2. Contracts & Types

```ts
type TaskStatus = "pending" | "completed";

interface Task {
  id: string;
  userId: string;
  title: string;
  dueDate: string | null;
  order: number;
  status: TaskStatus;
  deleted: boolean;
}

// POST /api/tasks
interface CreateTaskRequest {
  title: string;
  dueDate: string | null;
}
```

- Implicit `userId`: `default-user`
- New tasks: `status: "pending"`, `deleted: false`, `order` at end of visible list
- `GET /api/tasks` → non-deleted tasks for the implicit user, sorted by `order`
- Empty/whitespace `title` → 400

## 3. Execution Tasks

- [x] Domain types and `ITaskRepository`
- [x] `JsonTaskRepository` unit tests and implementation
- [x] `TaskService` list/create unit tests and implementation
- [x] HTTP integration tests and `TasksController`
- [x] Client API, hook, form + list UI and UI tests
