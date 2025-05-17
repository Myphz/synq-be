import { RequestHandler, type Request } from "express";
import { AuthError } from "../errors/auth-error.js";
import {
  createClientAs,
  getUserForJWT,
  supabase
} from "../supabase/supabase.js";
import { asyncHandler } from "../utils/async-handler.js";

export const getJwtFromHeader = (req: Request) => {
  const jwt = req.headers["authorization"];
  if (!jwt) throw new AuthError();

  if (!jwt.startsWith("Bearer")) return jwt;
  return jwt.slice("Bearer".length).trim();
};

export const getSupabaseUserFromRequest = async (req: Request) => {
  if ("_user" in req && req._user)
    return req._user as Awaited<ReturnType<typeof getUserForJWT>>;
  const jwt = getJwtFromHeader(req);
  try {
    const user = await getUserForJWT(jwt);
    // @ts-expect-error I really don't have time for this.
    req._user = user;
    return user;
  } catch {
    throw new AuthError();
  }
};

export const getSupabaseUserClientFromRequest = async (req: Request) => {
  if ("_client" in req && req._client) return req._client as typeof supabase;
  const jwt = getJwtFromHeader(req);
  // Validate JWT
  await getSupabaseUserFromRequest(req);
  // Return supabase client that acts as the current user
  return createClientAs(jwt);
};

export const requireAuth: RequestHandler = asyncHandler(
  async (req, _, next) => {
    const user = await getSupabaseUserClientFromRequest(req);
    // @ts-expect-error I really don't have time for this.
    req._client = user;
    next();
  }
);
