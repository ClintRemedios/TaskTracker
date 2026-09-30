import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import {
  CONTROLLER_PREFIX,
  HTTP_CODE,
  PARAMS,
  ROUTES,
  type ParamMeta,
  type RouteMeta,
} from "./decorators.js";

function joinPath(prefix: string, routePath: string): string {
  const left = prefix.replace(/\/$/, "");
  const right = routePath.replace(/^\//, "");
  if (!left && !right) {
    return "/";
  }
  if (!left) {
    return `/${right}`;
  }
  if (!right) {
    return left;
  }
  return `${left}/${right}`;
}

export function registerController(
  app: FastifyInstance,
  ControllerClass: new (...args: never[]) => object,
  instance: object,
): void {
  const prefix =
    (Reflect.getMetadata(CONTROLLER_PREFIX, ControllerClass) as string | undefined) ?? "";
  const routes: RouteMeta[] = Reflect.getMetadata(ROUTES, ControllerClass) ?? [];

  for (const route of routes) {
    const url = joinPath(prefix, route.path);
    const paramMeta: ParamMeta[] =
      Reflect.getMetadata(PARAMS, ControllerClass.prototype, route.handlerName) ?? [];
    const statusCode = Reflect.getMetadata(
      HTTP_CODE,
      ControllerClass.prototype,
      route.handlerName,
    ) as number | undefined;

    app.route({
      method: route.method,
      url,
      handler: async (request: FastifyRequest, reply: FastifyReply) => {
        const args: unknown[] = [];
        for (const meta of paramMeta) {
          if (meta.kind === "body") {
            args[meta.index] = request.body;
          } else {
            const params = request.params as Record<string, string>;
            args[meta.index] = params[meta.name];
          }
        }
        const handler = (instance as Record<string, (...handlerArgs: unknown[]) => unknown>)[
          route.handlerName
        ];
        const result = await handler.apply(instance, args);
        if (statusCode) {
          reply.code(statusCode);
        }
        if (statusCode === 204) {
          return reply.send();
        }
        return result;
      },
    });
  }
}
