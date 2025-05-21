import { HttpRequest, HttpResponse } from "uWebSockets.js";
import { AbortedError } from "../errors/aborted.js";
import { errorHandler } from "../middlewares/error.js";

export const enhanceRequest = (res: HttpResponse, req?: HttpRequest) => {
  if (res.isEnhanced) return;

  res.isEnhanced = true;

  res.onAborted(() => {
    console.log("ABORTED!");
    throw new AbortedError();
  });

  res.json = (data: object) => res.end(JSON.stringify(data));

  res.withErrorCheck = async (cb: () => Promise<unknown> | unknown) => {
    try {
      await cb();
    } catch (err) {
      errorHandler(err as Error, res);
    }
  };

  if (!req) return;

  const headers: Record<string, string> = {};
  req.forEach((key, value) => (headers[key.toLowerCase()] = value));

  res.reqHeaders = headers;
};
