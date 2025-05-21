import { SupabaseClient, User } from "@supabase/supabase-js";
import {
  HttpRequest,
  HttpResponse,
  us_socket_context_t,
  WebSocket
} from "uWebSockets.js";
import { Database } from "./supabase.js";

export type Handler = (
  res: HttpResponse,
  req: HttpRequest,
  ctx?: us_socket_context_t
) => void | Promise<void>;

export type Middleware = (fn: Handler) => Handler;

export type AuthData = { user: User; supabaseClient: SupabaseClient<Database> };
export type AuthSocket = WebSocket<AuthData>;
