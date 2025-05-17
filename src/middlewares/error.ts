import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { telegramLog } from "../utils/telegram-log.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type OverrideReturnType<T extends (...args: any[]) => any, R> = (
  ...args: Parameters<T>
) => R;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ErrorHandlerAnyReturn = OverrideReturnType<ErrorRequestHandler, any>;

export const errorHandler: ErrorHandlerAnyReturn = (
  err: Error,
  _req,
  res,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next
) => {
  if (err instanceof ZodError)
    return res
      .status(400)
      .json({ success: false, message: "Invalid Parameters" });

  if (process.env.NODE_ENV === "production") telegramLog(err);
  console.log(err);

  res
    .status(500)
    .json({ success: false, message: `Server error: ${err.message}` });
};
