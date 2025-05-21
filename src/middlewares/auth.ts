import { HttpRequest, HttpResponse } from "uWebSockets.js";
import { AuthError } from "../errors/auth-error.js";
import {
  createClientAs,
  getUserForJWT,
  supabase
} from "../supabase/supabase.js";
import { Middleware } from "../types/utils.js";
import { toMiddleware } from "../utils/middleware.js";

const getJwtFromHeader = (req: HttpRequest) => {
  const jwt = req.getHeader("authorization");
  if (!jwt) throw new AuthError();

  if (!jwt.startsWith("Bearer")) return jwt;
  return jwt.slice("Bearer".length).trim();
};

export const getSupabaseUser = async (res: HttpResponse, req: HttpRequest) => {
  if (res._user) return res._user as Awaited<ReturnType<typeof getUserForJWT>>;

  const jwt = getJwtFromHeader(req);

  try {
    const user = await getUserForJWT(jwt);
    res._user = user;
    return user;
  } catch {
    throw new AuthError();
  }
};

export const getSupabaseUserClient = async (
  res: HttpResponse,
  req: HttpRequest
) => {
  if ("_client" in req && res._client) return res._client as typeof supabase;
  const jwt = getJwtFromHeader(req);
  // Validate JWT
  await getSupabaseUser(res, req);
  // Return supabase client that acts as the current user
  return createClientAs(jwt);
};

export const withAuth: Middleware = toMiddleware(async (res, req) => {
  const user = await getSupabaseUserClient(res, req);
  res._client = user;
});
