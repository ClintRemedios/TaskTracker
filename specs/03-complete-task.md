# 03: Mark Task Completed

## 1. Goal & Scope

Users toggle a task between `pending` and `completed` with a checkbox.

**Non-goals:** delete, reorder, clean.

## 2. Contracts & Types

- `PATCH /api/tasks/:id` body `{ status: "pending" | "completed" }` → updated `Task`
- Missing, unknown, or deleted id → 404
- Invalid status → 400

## 3. Execution Tasks

- [x] Service/repo update status tests and implementation
- [x] HTTP integration tests
- [x] Checkbox UI and UI tests
