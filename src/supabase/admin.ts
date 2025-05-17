import { createClient } from "@supabase/supabase-js";
import { SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL } from "../constants.js";
import { Database } from "../types/supabase.js";

export const supabaseAdmin = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY
);
