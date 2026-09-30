# 07: Lint, Format, and Coverage

## 1. Goal & Scope

ESLint and Prettier manage coding style. Vitest collects coverage for the client and the server, and `npm test` fails when coverage is below 85%.

**In scope:** root ESLint and Prettier config, format and lint scripts, Vitest v8 coverage with an 85% threshold on lines, statements, functions, and branches for `client/src` and `server/src`.

**Non-goals:** formatting markdown specs, covering process bootstrap (`server/src/index.ts`, `client/src/main.tsx`).

## 2. Contracts & Types

- `npm run lint` runs ESLint and exits non-zero on violations.
- `npm run format` writes Prettier output. `npm run format:check` exits non-zero when files differ.
- `npm test` runs Vitest with coverage in both workspaces. Thresholds are 85% for lines, statements, functions, and branches.
- Coverage includes `src` and excludes `server/src/index.ts`, `client/src/main.tsx`, and `client/src/vite-env.d.ts`.

## 3. Execution Tasks

- [x] ESLint and Prettier config and scripts
- [x] Vitest coverage thresholds on client and server
- [x] Tests added until both packages meet 85%
- [x] Lint and format pass on the repo
