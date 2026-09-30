import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

const clientEnvPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../env/client/local.env.json",
);

function loadClientEnv(): Record<string, string> {
  try {
    const parsed = JSON.parse(readFileSync(clientEnvPath, "utf8")) as unknown;
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }
    const define: Record<string, string> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (!key.startsWith("VITE_") || value === null || value === undefined) {
        continue;
      }
      define[`import.meta.env.${key}`] = JSON.stringify(value);
    }
    return define;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return {};
    }
    throw error;
  }
}

export default defineConfig({
  plugins: [react()],
  define: loadClientEnv(),
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./test/setup.ts"],
    include: ["test/**/*.test.tsx", "test/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/main.tsx", "src/vite-env.d.ts"],
      thresholds: {
        lines: 85,
        statements: 85,
        functions: 85,
        branches: 85,
      },
    },
  },
});
