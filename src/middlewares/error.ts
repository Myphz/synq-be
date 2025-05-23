import { HttpResponse } from "uWebSockets.js";
import { ZodError } from "zod";
import { AbortedError } from "../errors/aborted.js";
import { AuthError } from "../errors/auth-error.js";
import { enhanceRequest } from "../utils/enhance.js";
import { telegramLog } from "../utils/telegram-log.js";

export const errorHandler = (err: Error, res: HttpResponse) => {
  enhanceRequest(res);

  if (err instanceof ZodError)
    return res.cork(() => {
      res
        .writeStatus("400 Bad Request")
        .json({ success: false, message: "Invalid Parameters" });
    });

  if (err instanceof AbortedError)
    return res.cork(() => {
      res
        .writeStatus("400 Bad Request")
        .json({ success: false, message: "Request Aborted" });
    });

  if (err instanceof AuthError)
    return res.cork(() => {
      res
        .writeStatus("401 Unauthorized")
        .json({ success: false, message: err.message });
    });

  // Supabase RLS error - equivalent to AuthError
  if ("code" in err && err.code === "42501")
    return res.cork(() => {
      res
        .writeStatus("401 Unauthorized")
        .json({ success: false, message: `Supabase error: ${err.message}` });
    });

  if (process.env.NODE_ENV === "production") telegramLog(err);
  console.log(err);

  return res.cork(() => {
    res
      .writeStatus("500 Internal Server Error")
      .json({ success: false, message: `Server error: ${err.message}` });
  });
};
