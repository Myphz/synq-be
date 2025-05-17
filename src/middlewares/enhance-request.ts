import { HttpResponse } from "uWebSockets.js";
import { AbortedError } from "../errors/aborted.js";
import { toMiddleware } from "../utils/middleware.js";

export const withEnhancedRequest = toMiddleware((res: HttpResponse) => {
  res.onAborted(() => (res.aborted = true));
  const originalEnd = res.end.bind(res);

  res.end = (...params: Parameters<typeof originalEnd>) => {
    if (res.aborted) throw new AbortedError();
    return originalEnd(...params);
  };

  res.json = (data: object) => res.end(JSON.stringify(data));
});
