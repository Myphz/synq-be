import type { WebSocketBehavior } from "uWebSockets.js";
import { getSupabaseUser, getSupabaseUserClient } from "../middlewares/auth.js";
import { getInitialSyncData } from "../supabase/api.js";
import { AuthData, AuthSocket } from "../types/utils.js";
import { enhanceRequest } from "../utils/enhance.js";
import { parseMessage } from "../utils/zod.js";
import { connectedClients } from "./clients.js";
import { send, sendBroadcastMessage } from "./helpers.js";
import { processMessage } from "./process-message.js";
import type { ClientMessage, ServerMessage } from "./protocol.js";

export const onUpgradeRequest: WebSocketBehavior<AuthData>["upgrade"] = async (
  res,
  req,
  ctx
) => {
  enhanceRequest(res, req);

  res.withErrorCheck(async () => {
    const user = await getSupabaseUser(res);
    const supabaseClient = await getSupabaseUserClient(res);

    if (connectedClients.get(user.id)) {
      console.log(
        "WARN: Same user is connecting twice, dropped old connection"
      );
      connectedClients.get(user.id)!.ws.close();
    }

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
  const { chats: chatsData } = await getInitialSyncData(supabaseClient);

  connectedClients.set(user.id, {
    ws,
    chats: chatsData.map((chat) => ({
      id: chat.chat_id,
      isTyping: false
    }))
  });

  // Subscribe ws to all of its chats
  chatsData.forEach((chat) => {
    // Socket might be disconnected already for some reason
    try {
      ws.subscribe(chat.chat_id.toString());
    } catch {
      connectedClients.delete(user.id);
      return;
    }

    // Notify everyone else of our new online status
    const message: ServerMessage = {
      type: "UPDATE_USER_STATUS",
      userId: user.id,
      chatId: chat.chat_id,
      data: {
        isTyping: false,
        isOnline: true
      }
    };

    sendBroadcastMessage({ ws, chatId: chat.chat_id, message });
  });

  // Send initial data
  const initialSyncData: ServerMessage = {
    type: "INITIAL_SYNC",
    chats: chatsData.map((chat) => ({
      name: chat.chat_name,
      chatId: chat.chat_id,
      unreadMessagesCount: chat.unread_messages_count,
      lastMessage: chat.last_message
        ? {
            id: chat.last_message.id,
            senderId: chat.last_message.sender_id,
            content: chat.last_message.content,
            sentAt: chat.last_message.timestamp,
            isRead: chat.last_message.is_read
          }
        : null,
      members: chat.members.map((member) => ({
        id: member.id,
        name: member.name,
        username: member.username,
        lastSeen: member.last_seen,
        avatarUrl: member.avatar_url,
        isOnline: !!connectedClients.get(member.id),
        isTyping:
          connectedClients
            .get(member.id)
            ?.chats.find((memberChat) => memberChat.id === chat.chat_id)
            ?.isTyping || false
      }))
    }))
  };

  send({ ws, message: initialSyncData });
};

export const onConnectionClose = (ws: AuthSocket) => {
  const { user, supabaseClient } = ws.getUserData();

  const userData = connectedClients.get(user.id);
  connectedClients.delete(user.id);

  if (!userData)
    return console.log(
      "WARN: onConnectionClose: can't get chats for disconnected user"
    );

  const now = new Date().toISOString();

  userData.chats.forEach((chat) => {
    // Notify everyone else of our new offline status
    const message: ServerMessage = {
      type: "UPDATE_USER_STATUS",
      userId: user.id,
      chatId: chat.id,
      data: {
        isTyping: false,
        isOnline: false,
        lastSeen: now
      }
    };

    sendBroadcastMessage({ chatId: chat.id, message });
  });

  // Update user's last_seen timestamp value
  supabaseClient
    .from("profiles")
    .update({ last_seen: now })
    .eq("id", user.id)
    .then();
};

export const onMessage: WebSocketBehavior<AuthData>["message"] = async (
  ws,
  msg
) => {
  let message: ClientMessage;

  try {
    message = parseMessage(msg);
  } catch {
    // Bogus-amogus message, kill the client, how dare him
    console.log("Received bogus amogus:", new TextDecoder().decode(msg).trim());
    return ws.close();
  }

  await processMessage(ws, message);
};
