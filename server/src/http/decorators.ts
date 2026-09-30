import "reflect-metadata";

export const CONTROLLER_PREFIX = Symbol("controllerPrefix");
export const ROUTES = Symbol("routes");
export const PARAMS = Symbol("params");
export const HTTP_CODE = Symbol("httpCode");

export type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

export type RouteMeta = {
  method: HttpMethod;
  path: string;
  handlerName: string;
};

export type ParamMeta =
  { index: number; kind: "body" } | { index: number; kind: "param"; name: string };

export function Controller(prefix = "") {
  // Class decorators receive the constructor. `Function` matches that target.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type -- decorator target is the class constructor
  return (target: Function) => {
    Reflect.defineMetadata(CONTROLLER_PREFIX, prefix, target);
  };
}

function addRoute(method: HttpMethod, path: string) {
  return (target: object, handlerName: string) => {
    const ctor = target.constructor;
    const routes: RouteMeta[] = Reflect.getMetadata(ROUTES, ctor) ?? [];
    routes.push({ method, path, handlerName });
    Reflect.defineMetadata(ROUTES, routes, ctor);
  };
}

export function Get(path = "") {
  return addRoute("GET", path);
}

export function Post(path = "") {
  return addRoute("POST", path);
}

export function Patch(path = "") {
  return addRoute("PATCH", path);
}

export function Put(path = "") {
  return addRoute("PUT", path);
}

export function Delete(path = "") {
  return addRoute("DELETE", path);
}

export function Body() {
  return (target: object, propertyKey: string | symbol, parameterIndex: number) => {
    const params: ParamMeta[] = Reflect.getMetadata(PARAMS, target, propertyKey) ?? [];
    params.push({ index: parameterIndex, kind: "body" });
    Reflect.defineMetadata(PARAMS, params, target, propertyKey);
  };
}

export function Param(name: string) {
  return (target: object, propertyKey: string | symbol, parameterIndex: number) => {
    const params: ParamMeta[] = Reflect.getMetadata(PARAMS, target, propertyKey) ?? [];
    params.push({ index: parameterIndex, kind: "param", name });
    Reflect.defineMetadata(PARAMS, params, target, propertyKey);
  };
}

export function HttpCode(statusCode: number) {
  return (target: object, propertyKey: string) => {
    Reflect.defineMetadata(HTTP_CODE, statusCode, target, propertyKey);
  };
}

/** Reserved for auth later. No-op in this MVP. */
export function UseGuards(..._guards: unknown[]) {
  return (_target: object, _propertyKey?: string | symbol) => {};
}
