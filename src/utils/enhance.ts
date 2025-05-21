import { HttpRequest, HttpResponse } from "uWebSockets.js";
import { AbortedError } from "../errors/aborted.js";

export const enhanceRequest = (res: HttpResponse, req?: HttpRequest) => {
  if (res.isEnhanced) return;

  res.isEnhanced = true;

  res.onAborted(() => {
    console.log("ABORTED!");
    throw new AbortedError();
  });

  res.json = (data: object) => res.end(JSON.stringify(data));

  if (!req) return;

  const headers: Record<string, string> = {};
  req.forEach((key, value) => (headers[key.toLowerCase()] = value));

  res.reqHeaders = headers;
};
