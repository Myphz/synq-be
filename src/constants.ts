import dotenv from "dotenv";
import { throwError } from "./utils/throw.js";

dotenv.config();

const getEnvValue = (varName: string) => {
  const ret = process.env[varName];
  if (!ret) throwError(`${varName} environment variable not set!`);

  return ret.trim();
};

export const TELEGRAM_API_KEY = getEnvValue("TELEGRAM_API_KEY");
export const TELEGRAM_CHAT_ID = "644102713";
