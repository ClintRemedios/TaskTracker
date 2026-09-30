import type { TaskStatus } from "../domain/task.js";
import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from "../http/decorators.js";
import { TaskService } from "../services/TaskService.js";

type CreateTaskBody = {
  title: string;
  dueDate: string | null;
};

type StatusBody = {
  status: TaskStatus;
};

type ReorderBody = {
  orderedIds: string[];
};

@Controller("/api/tasks")
export class TasksController {
  constructor(private readonly tasks: TaskService) {}

  @Get("/")
  list() {
    return this.tasks.list();
  }

  @Post("/")
  create(@Body() body: CreateTaskBody) {
    return this.tasks.create(body ?? { title: "", dueDate: null });
  }

  @Patch("/reorder")
  reorder(@Body() body: ReorderBody) {
    return this.tasks.reorder(body?.orderedIds);
  }

  @Post("/clean-completed")
  cleanCompleted() {
    return this.tasks.cleanCompleted();
  }

  @Patch("/:id")
  updateStatus(@Param("id") id: string, @Body() body: StatusBody) {
    return this.tasks.updateStatus(id, body?.status);
  }

  @Delete("/:id")
  @HttpCode(204)
  async remove(@Param("id") id: string) {
    await this.tasks.delete(id);
  }
}
