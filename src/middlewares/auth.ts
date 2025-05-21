import { HttpResponse } from "uWebSockets.js";
import { AuthError } from "../errors/auth-error.js";
import {
  createClientAs,
  getUserForJWT,
  supabase
} from "../supabase/supabase.js";

const getJwtFromHeader = (res: HttpResponse) => {
  const jwt = res.reqHeaders["authorization"];
  if (!jwt) throw new AuthError();

  if (!jwt.startsWith("Bearer")) return jwt;
  return jwt.slice("Bearer".length).trim();
};

export const getSupabaseUser = async (res: HttpResponse) => {
  if (res._user) return res._user as Awaited<ReturnType<typeof getUserForJWT>>;

  const jwt = getJwtFromHeader(res);

  try {
    const user = await getUserForJWT(jwt);
    res._user = user;
    return user;
  } catch {
    throw new AuthError();
  }
};

export const getSupabaseUserClient = async (res: HttpResponse) => {
  if (res._client) return res._client as typeof supabase;
  const jwt = getJwtFromHeader(res);
  // Validate JWT
  await getSupabaseUser(res);
  // Get supabase client that acts as the current user
  const client = createClientAs(jwt);
  res._client = client;
  return client;
};

// export const withAuth: Middleware = toMiddleware(async (res, req) => {
//
//
// });
