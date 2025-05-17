import { HttpRequest, HttpResponse } from "uWebSockets.js";

export type Handler = (
  res: HttpResponse,
  req: HttpRequest
) => unknown | Promise<unknown>;

export type Middleware = (fn: Handler) => Handler;
