import type { WebSocket, WebSocketBehavior } from "uWebSockets.js";
import { getSupabaseUser, getSupabaseUserClient } from "../middlewares/auth.js";
import { getAllChatsForUser } from "../supabase/api.js";
import { AuthData, AuthSocket } from "../types/utils.js";
import { enhanceRequest } from "../utils/enhance.js";
import { parseMessage } from "../utils/zod.js";
import { processMessage } from "./chats.js";
import { sendBroadcastMessage } from "./helpers.js";
import type { Message } from "./protocol.js";

export const connectedClients = new Map<string, WebSocket<AuthData>>();

export const onUpgradeRequest: WebSocketBehavior<AuthData>["upgrade"] = async (
  res,
  req,
  ctx
) => {
  enhanceRequest(res, req);

  res.withErrorCheck(async () => {
    const user = await getSupabaseUser(res);
    const supabaseClient = await getSupabaseUserClient(res);

    res.cork(() => {
      res.upgrade(
        { user, supabaseClient },
        res.reqHeaders["sec-websocket-key"],
        // This header's second value is used
        // to pass authorization token (jwt) from the browser.
        // https://stackoverflow.com/a/77060459
        res.reqHeaders["sec-websocket-protocol"].split(",")?.[0],
        res.reqHeaders["sec-websocket-extensions"],
        ctx!
      );
    });
  });
};

export const onNewConnection: WebSocketBehavior<AuthData>["open"] = async (
  ws
) => {
  const { user, supabaseClient } = ws.getUserData();
  connectedClients.set(user.id, ws);

  // Subscribe ws to all of its chats
  const userChats = await getAllChatsForUser(supabaseClient);

  userChats.forEach((chatId) => {
    ws.subscribe(chatId.toString());

    // Notify everyone else of our new online status
    const message: Message = {
      type: "UPDATE_USER_STATUS",
      userId: user.id,
      chatId: chatId,
      data: {
        isOnline: true
      }
    };

    sendBroadcastMessage({ ws, chatId, message });
  });
};

const onConnectionClose = (ws: AuthSocket) => {
  const { user } = ws.getUserData();
  connectedClients.delete(user.id);

  // @ts-expect-error its ok
  if (ws.isClosed) return;

  const chats = ws.getTopics();
  chats.forEach((chatId) => {
    // Notify everyone else of our new offline status
    const message: Message = {
      type: "UPDATE_USER_STATUS",
      userId: user.id,
      chatId,
      data: {
        isOnline: false
      }
    };

    sendBroadcastMessage({ chatId, message });
  });
};

export const onSubscriptionChange: WebSocketBehavior<AuthData>["subscription"] =
  (ws, _, newCount) => {
    if (newCount === 0) {
      onConnectionClose(ws);
    }
  };

export const onMessage: WebSocketBehavior<AuthData>["message"] = async (
  ws,
  msg
) => {
  let message: Message;

  try {
    message = parseMessage(msg);
  } catch {
    // Bogus-amogus message, kill the client, how dare him
    onConnectionClose(ws);
    return ws.close();
  }

  await processMessage(ws, message);
};
