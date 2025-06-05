import { v4 as uuidv4 } from "uuid";
import { getChatMembers } from "../supabase/api.js";
import { AuthSocket } from "../types/utils.js";
import { connectedClients } from "./clients.js";
import { getConnectedClient, sendBroadcastMessage } from "./helpers.js";
import { sendNotification } from "./notifications.js";
import {
  ClientMessage,
  ServerMessage,
  serverMessageSchema
} from "./protocol.js";

export const processMessage = async (
  ws: AuthSocket,
  message: ClientMessage
) => {
  const chatId = Number(message.chatId);
  const { user, supabaseClient } = ws.getUserData();
  // Client is trying to send a message to a new chat
  if (!ws.getTopics().includes(chatId.toString())) {
    // subscribe all chat members to this chat
    const members = await getChatMembers(supabaseClient, chatId);
    // client is trying to send message to a chat he doesn't have access to?
    if (!members.includes(user.id)) throw new Error("TODO");

    members.forEach((userId) => {
      const user = connectedClients.get(userId);
      if (!user) return;
      user.ws.subscribe(chatId.toString());
    });
  }

  switch (message.type) {
    case "SEND_MESSAGE": {
      const { content } = message.data;
      const now = new Date().toISOString();
      const id = uuidv4();

      supabaseClient
        .from("messages")
        .insert({ chat_id: chatId, text: content, id, created_at: now })
        .then();

      const socketMessage = {
        type: "RECEIVE_MESSAGE",
        userId: user.id,
        chatId,
        data: {
          id,
          content,
          sentAt: now
        }
      } satisfies ServerMessage;

      sendBroadcastMessage({ chatId, message: socketMessage });

      // Send notification to offline members
      const members = await getChatMembers(supabaseClient, chatId);
      const offlineMembers = members.filter(
        (member) => !connectedClients.has(member)
      );

      offlineMembers.forEach((member) =>
        sendNotification({
          userId: member,
          message: content,
          senderId: user.id
        })
      );
      break;
    }

    case "READ_MESSAGE": {
      const { messageId } = message.data;

      supabaseClient
        .from("messages")
        .update({ is_read: true })
        .eq("id", messageId)
        .then();

      break;
    }

    case "UPDATE_USER_TYPING": {
      // Update isTyping status for connected client
      // && send UPDATE_USER_STATUS msg
      const client = getConnectedClient(user.id);
      connectedClients.set(user.id, {
        ...client,
        chats: client.chats.map((chat) => {
          if (Number(chat.id) !== chatId) return chat;
          return { ...chat, isTyping: message.data.isTyping };
        })
      });

      const socketMessage = {
        type: "UPDATE_USER_STATUS",
        userId: user.id,
        chatId,
        data: message.data
      } satisfies ServerMessage;

      sendBroadcastMessage({ chatId, message: socketMessage });

      break;
    }

    case "REQUEST_MESSAGES": {
      // Fetch the latest messages and send them to the client
      const { data: messages } = await supabaseClient
        .from("messages")
        .select("*")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: false })
        .limit(100)
        .throwOnError();

      const message = {
        type: "GET_MESSAGES",
        chatId,
        data: {
          messages: messages.map((msg) => ({
            id: msg.id,
            content: msg.text,
            senderId: msg.user_id,
            sentAt: msg.created_at,
            isRead: msg.is_read || false
          }))
        }
      } satisfies ServerMessage;

      ws.send(JSON.stringify(message));
    }
  }

  // Broadcast message to everyone if it's a server-allowed message
  const isServerMessage = serverMessageSchema.safeParse(message);
  if (isServerMessage.success) {
    sendBroadcastMessage({ chatId, message: isServerMessage.data });
  }
};
