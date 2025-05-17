import { errorHandler } from "../middlewares/error.js";
import { Handler, Middleware } from "../types/utils.js";

export const toMiddleware =
  (middleware: Handler): Middleware =>
  (handler) =>
  async (res, req) => {
    try {
      await middleware(res, req);
      await handler(res, req);
    } catch (err) {
      errorHandler(err as Error, res);
    }
  };
