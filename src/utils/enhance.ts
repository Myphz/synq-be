import { HttpResponse } from "uWebSockets.js";
import { AbortedError } from "../errors/aborted.js";

export const enhanceRequest = (res: HttpResponse) => {
  res.onAborted(() => (res.aborted = true));
  const originalEnd = res.end.bind(res);

  res.end = (...params: Parameters<typeof originalEnd>) => {
    if (res.aborted) throw new AbortedError();
    return originalEnd(...params);
  };

  res.json = (data: object) => res.end(JSON.stringify(data));
};
