import type { RequestHandler } from "express";

type RequestHandlerThatCanReturnAnythingIDontReallyCare = (
  ...args: Parameters<RequestHandler>
) => unknown;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Asyncify<T extends (...args: any) => any> = (
  ...args: Parameters<T>
) => Promise<ReturnType<T>>;

export const asyncHandler =
  (
    fn: Asyncify<RequestHandlerThatCanReturnAnythingIDontReallyCare>
  ): RequestHandler =>
  (req, res, next) => {
    fn(req, res, next).catch(next);
  };
