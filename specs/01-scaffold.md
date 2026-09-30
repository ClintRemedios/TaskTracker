# 01: Project Scaffold

## 1. Goal & Scope

Stand up a runnable Task Tracker client and server with empty architecture layers and a health check. No task CRUD yet.

**In scope:** package setup, TypeScript, decorator HTTP routing, Vitest, Vite React app, `/health`, empty task list page, persistence factory stub for later JSON/Postgres.

**Non-goals:** task APIs, Postgres, authentication.

## 2. Contracts & Types

- `GET /health` → `{ status: "ok" }`
- Environment files live under `env/`, named `{environment}.env.json` (for example `local.env.json`). Client and server each have their own file.

## 3. Execution Tasks

- [x] Server package (Fastify, tsx, Vitest, reflect-metadata, decorator router)
- [x] `GET /health` integration test and implementation
- [x] Persistence factory throws for `postgres` / unknown drivers
- [x] Client Vite + React + TypeScript + Vitest/RTL
- [x] Empty task list page and global styles
- [x] Vite proxy `/api` → Fastify
