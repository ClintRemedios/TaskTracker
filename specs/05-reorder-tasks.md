# 05: Reorder Tasks

## 1. Goal & Scope

Users drag tasks to a new position. Persist `order` 0..n-1 for the visible list.

Each row has a grip on the left. That grip is the only drag handle. While a task is dragged, its row fades, and a line sits in the gap where the task will land. The top half of a row marks the gap above it; the bottom half marks the gap below it. No line shows when dropping there would leave the order unchanged. Releasing on the line moves the task.

**Non-goals:** nested lists, dragging from the title, checkbox, or delete button.

## 2. Contracts & Types

- `PATCH /api/tasks/reorder` body `{ orderedIds: string[] }`
- `orderedIds` must be a permutation of current non-deleted task ids for the implicit user; otherwise 400
- After success, list order matches `orderedIds`

## 3. Execution Tasks

- [x] Service/repo replaceOrder tests and implementation
- [x] HTTP integration tests
- [x] HTML5 drag-and-drop list UI and UI tests
- [x] Left grip handle and drop-zone line between rows
