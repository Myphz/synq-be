import { HttpRequest, HttpResponse, us_socket_context_t } from "uWebSockets.js";

export type Handler = (
  res: HttpResponse,
  req: HttpRequest,
  ctx?: us_socket_context_t
) => void | Promise<void>;

export type Middleware = (fn: Handler) => Handler;
