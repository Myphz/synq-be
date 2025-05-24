import { createClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "../constants.js";
import { Database } from "../types/supabase.js";

export const getUserForJWT = async (jwt: string) => {
  const {
    data: { user }
  } = await supabase.auth.getUser(jwt);

  if (!user) throw new Error("Invalid JWT");
  return user;
};

export const createClientAs = (jwt: string) => {
  let token = jwt;

  if (!token.startsWith("Bearer")) {
    token = `Bearer ${token}`;
  }

  return createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: token } }
  });
};

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
