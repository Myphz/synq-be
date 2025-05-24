import { z } from "zod";
import { clientMessageSchema } from "../server/protocol.js";

export const parseJsonString = z.string().transform((str, ctx) => {
  try {
    return JSON.parse(str);
  } catch {
    ctx.addIssue({ code: "custom", message: "Invalid JSON" });
    return z.NEVER;
  }
});

export const parseMessage = (message: ArrayBuffer) => {
  const msgString = new TextDecoder().decode(message).trim();
  return clientMessageSchema.parse(JSON.parse(msgString));
};
