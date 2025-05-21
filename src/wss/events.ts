import type { WebSocket, WebSocketBehavior } from "uWebSockets.js";
import { getSupabaseUser, getSupabaseUserClient } from "../middlewares/auth.js";
import { AuthData } from "../types/utils.js";
import { enhanceRequest } from "../utils/enhance.js";

export const connectedClients = new Map<string, WebSocket<AuthData>>();

export const onUpgradeRequest: WebSocketBehavior<AuthData>["upgrade"] = async (
  res,
  req,
  ctx
) => {
  enhanceRequest(res, req);
  const user = await getSupabaseUser(res);
  const supabaseClient = await getSupabaseUserClient(res);

  res.cork(() => {
    res.upgrade(
      { user, supabaseClient },
      res.reqHeaders["sec-websocket-key"],
      res.reqHeaders["sec-websocket-protocol"],
      res.reqHeaders["sec-websocket-extensions"],
      ctx!
    );
  });
};

export const onNewConnection: WebSocketBehavior<AuthData>["open"] = async (
  ws
) => {
  const { user, supabaseClient } = ws.getUserData();
  connectedClients.set(user.id, ws);

  // Subscribe ws to all of its chats
  const { data: userChats } = await supabaseClient
    .from("chats")
    .select("id")
    .throwOnError();

  userChats.forEach((chat) => {
    ws.subscribe(chat.id.toString());
  });
};
