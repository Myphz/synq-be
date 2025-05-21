import { HttpRequest, HttpResponse } from "uWebSockets.js";

export type Handler = (
  res: HttpResponse,
  req: HttpRequest,
  ctx?: any
) => void | Promise<void>;

export type Middleware = (fn: Handler) => Handler;
