# 04: Delete Single Task

## 1. Goal & Scope

Users remove a task from the list via an X button. Soft-delete (`deleted: true`).

**Non-goals:** hard delete, clean-all.

## 2. Contracts & Types

- `DELETE /api/tasks/:id` → 204
- Missing or already deleted → 404
- Deleted tasks do not appear in `GET /api/tasks`

## 3. Execution Tasks

- [x] Service/repo soft-delete tests and implementation
- [x] HTTP integration tests
- [x] Row X button UI and UI tests
