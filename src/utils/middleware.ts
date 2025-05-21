import { errorHandler } from "../middlewares/error.js";
import { Handler, Middleware } from "../types/utils.js";
import { enhanceRequest } from "./enhance.js";

export const toMiddleware =
  (middleware: Handler): Middleware =>
  (handler) =>
  async (res, req) => {
    try {
      enhanceRequest(res, req);
      await middleware(res, req);
      await handler(res, req);
    } catch (err) {
      errorHandler(err as Error, res);
    }
  };
