import { z } from "zod";

export const parseJsonString = z.string().transform((str, ctx) => {
  try {
    return JSON.parse(str);
  } catch {
    ctx.addIssue({ code: "custom", message: "Invalid JSON" });
    return z.NEVER;
  }
});
