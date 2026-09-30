# 06: Clean Completed Tasks

## 1. Goal & Scope

Users click **Clean** to soft-delete every visible `completed` task.

**Non-goals:** undo, archive UI.

## 2. Contracts & Types

- `POST /api/tasks/clean-completed` → `{ deletedCount: number }`
- Only `status === "completed"` and `deleted === false` are removed from the list
- Pending tasks are unchanged

## 3. Execution Tasks

- [x] Service/repo softDeleteCompleted tests and implementation
- [x] HTTP integration tests
- [x] Clean button UI and UI tests
