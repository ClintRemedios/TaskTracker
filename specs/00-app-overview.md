# 00: Application Overview & Product Domain

## 1. Product Vision & Goals
**Product Name:** Task Tracker
**Core Purpose:** A lightweight, self-hosted web application for people to manage task, track task status, and due date.

## 2. Core User Workflows (What the App Does)
### Workflow 1: Task Change status
1. User goes into the task list endpoint.
2. User creates Tasks within the project (Title, Status, Due Date).
3. User transitions task status to `completed` by checking off box.

### Workflow 2: Reorganize List
1. User goes into the task list endpoint.
2. User drags a task by the grip on its left. A line between rows shows where it will land. Dropping there updates the order.

### Workflow 3: Cleans up completed task
1. User goes into the task list endpoint.
2. User clicks `Clean` button to delete all `completed` task from the visible list

### Workflow 4: Delete single task
1. User goes into the task list endpoint.
2. User deletes the task by clicking the x button associated to the task


## 3. Domain Model Entities (High-Level Data Concept)
- **User:** `id`, `email`
- **Task:** `id`, `userId`, `title`, `due_date`, `order`, `status` (`pending` | `completed`), `deleted`

## 4. System Non-Goals (Explicit Exclusions)  
*What this MVP will NOT do*
- no authentication for now.