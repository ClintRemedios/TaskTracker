# Tech Stack & Architecture Rules

## Stack
- Frontend: React (Vite), TypeScript, Plain CSS.
- Backend: Node.js, Fastify, TypeScript (`tsx` runner).
- Testing Framework: Vitest.

## Domain Values
- Use a string enum for each closed set of string codes, and refer to those codes through the enum members.

## Environment
- **Env files (`env/`):** Keep environment files under the repo-root `env/` folder as JSON objects. Name them `{environment}.env.json` (for example `local.env.json` for local). Client and server must not share a file: `env/server/local.env.json` and `env/client/local.env.json`. Do not place env files in `client/`, `server/`, or the repo root.

## Backend Architecture & Directories
- **Routing:** Use TypeScript class and method decorators (`@Controller()`, `@Get()`, `@Post()`, `@UseGuards()`, `@Body()`).
- **Controller Layer (`server/src/controllers/`):** Request parsing, DTO validation, HTTP response mapping. *No database or business logic allowed here.*
- **Service Layer (`server/src/services/`):** Pure business logic and domain orchestration. Inject repositories via interfaces. *Framework and HTTP agnostic.*
- **Repository Layer (`server/src/repositories/`):** Direct database access and queries. Implements repository interfaces.

## Frontend Architecture & Directories
- **Component Layer (`client/src/components/`):** Pure presentation UI components. Focuses solely on rendering HTML elements, styling, and receiving props. *No direct fetch calls allowed here.*
- **Hook Layer (`client/src/hooks/`):** State management, side effects, and UI behavior. Encapsulates form handlers, page state, and data fetching hooks.
- **API / Client Layer (`client/src/api/`):** HTTP client functions and type-safe API callers targeting backend routes.
- **Pages / Views (`client/src/pages/`):** Top-level route views that compose components and hooks together.
- **Styles (`client/src/styles/`):** CSS variables, global reset styles, and scoped CSS modules/files.

## Planning & Spec Execution Workflow
- **Directory (`specs/`):** All new features, architectural decisions, and setup phases must start with a markdown specification in `specs/`.
- **Spec Structure (`specs/XX-<feature-name>.md`):**
  1. **Goal & Scope:** Clear description of user intent, in-scope, and explicit non-goals.
  2. **Contracts & Types:** Data models, request/response DTOs, and shared type definitions.
  3. **Execution Tasks:** Itemized task checklist for bottom-up execution.
- **Execution Rules for AI Agents:**
  1. **Read Spec First:** Always read the designated spec file in `specs/` before creating or editing files.
  2. **Scaffold First:** Create interfaces, DTOs, and function stubs returning `throw new Error('Not implemented')` across layers before implementing logic.
  3. **Write Tests Before Code:** Create failing unit/integration tests matching the spec assertions before writing feature code.
  4. **Bottom-Up Order:** Implement in sequence: `Repositories` -> `Services` -> `Controllers` -> `API Hooks` -> `UI Components`.
  5. **Mark Completion:** Check off task boxes in the spec file as implementation tests pass.

## Testing Directory Structure
- **Unit Test (`server/test/unit/`):** Pure unit tests. Tests Services and Repositories in isolation using Vitest mocks (`vi.fn()`).
- **Integration Test (`server/test/integration/`):** HTTP integration tests using `fastify.inject()` to hit API routes end-to-end without opening a network port.
- **UI Test (`client/test/UI/`):** Component rendering and user interaction tests using Vitest and React Testing Library (or MSW for API mocking).

## Coding Style
- Use ESLint and Prettier to manage coding style.
- Match the project's ESLint and Prettier configuration. Do not hand-format code in a way that conflicts with those tools.
- Run `npm run lint` and `npm run format:check` on changed code and fix violations before considering the work complete.

## Test Coverage
- Collect code coverage with Vitest for both `client` and `server`. `npm test` enforces it.
- Keep lines, statements, functions, and branches at 85% or higher.
- Do not finish a change that drops coverage below 85%. Add or update tests until the threshold is met.