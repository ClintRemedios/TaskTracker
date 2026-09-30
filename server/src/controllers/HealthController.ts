import { Controller, Get } from "../http/decorators.js";

@Controller()
export class HealthController {
  @Get("/health")
  health() {
    return { status: "ok" };
  }
}
