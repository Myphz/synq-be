import dotenv from "dotenv";
import { throwError } from "./utils/throw.js";

dotenv.config();

const getEnvValue = (varName: string) => {
  const ret = process.env[varName];
  if (!ret) throwError(`${varName} environment variable not set!`);

  return ret.trim();
};

export const SUPABASE_URL = getEnvValue("SUPABASE_URL");
export const SUPABASE_ANON_KEY = getEnvValue("SUPABASE_ANON_KEY");
export const SUPABASE_JWT_SECRET = getEnvValue("SUPABASE_JWT_SECRET");
export const SUPABASE_SERVICE_ROLE_KEY = getEnvValue(
  "SUPABASE_SERVICE_ROLE_KEY"
);

export const TELEGRAM_API_KEY = getEnvValue("TELEGRAM_API_KEY");
export const TELEGRAM_CHAT_ID = "644102713";

export const FIREBASE_SERVICE_ACCOUNT = JSON.parse(
  getEnvValue("FIREBASE_SERVICE_ACCOUNT")
);
