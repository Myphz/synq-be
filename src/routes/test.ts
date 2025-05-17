import express, { Request, Response } from "express";
import { z } from "zod";
import { validateBody } from "../middlewares/validate.js";
import { asyncHandler } from "../utils/async-handler.js";

export const TestAPI = express.Router();

const paramsSchema = z.object({
  entityId: z.string().regex(/^\d+$/).transform(Number)
});

const withEntityParam = validateBody(paramsSchema, "query");

TestAPI.get(
  "/test",
  withEntityParam,
  asyncHandler(async (req: Request, res: Response) => {
    const { entityId } = paramsSchema.parse(req.query);
    res.json({ entityId });
  })
);
