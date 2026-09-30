import Fastify from "fastify";
import type { FastifyInstance } from "fastify";
import { HealthController } from "./controllers/HealthController.js";
import { TasksController } from "./controllers/TasksController.js";
import { HttpError } from "./errors.js";
import { registerController } from "./http/registerController.js";
import { createTaskRepository } from "./repositories/createTaskRepository.js";
import { TaskService } from "./services/TaskService.js";

export type AppOptions = {
  jsonFilePath: string;
  persistenceDriver?: string;
};

export async function buildApp(options: AppOptions): Promise<FastifyInstance> {
  const app = Fastify({ logger: false });

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof HttpError) {
      return reply.status(error.statusCode).send({ message: error.message });
    }
    if (error instanceof Error) {
      const statusCode = (error as Error & { statusCode?: number }).statusCode;
      if (typeof statusCode === "number" && statusCode >= 400 && statusCode < 600) {
        return reply.status(statusCode).send({ message: error.message });
      }
    }
    return reply.status(500).send({ message: "Internal Server Error" });
  });

  const repository = createTaskRepository({
    driver: options.persistenceDriver ?? "json",
    jsonFilePath: options.jsonFilePath,
  });
  const taskService = new TaskService(repository);

  registerController(app, HealthController, new HealthController());
  registerController(app, TasksController, new TasksController(taskService));

  return app;
}
