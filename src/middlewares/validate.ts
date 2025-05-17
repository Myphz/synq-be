import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";

// Middleware to validate request body
export const validateBody =
  (schema: ZodSchema, key: keyof Request = "body") =>
  (req: Request, res: Response, next: NextFunction) => {
    schema.parse(req[key]);
    next();
  };
