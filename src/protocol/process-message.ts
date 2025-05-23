import { getChatMembers } from "../supabase/api.js";
import { AuthSocket } from "../types/utils.js";
import { connectedClients } from "./clients.js";
import { getConnectedClient, sendBroadcastMessage } from "./helpers.js";
import { ClientMessage, serverMessageSchema } from "./schemas.js";

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
      // Client lied about his user id. Kill him.
      if (message.userId !== user.id) return ws.close();

      const { content } = message.data;

      supabaseClient
        .from("messages")
        .insert({ chat_id: chatId, text: content })
        .then();

      // TODO: Send notification to offline members
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
      const client = getConnectedClient(user.id);
      connectedClients.set(user.id, {
        ...client,
        chats: client.chats.map((chat) => {
          if (Number(chat.id) !== chatId) return chat;
          return { ...chat, isTyping: message.data.isTyping! };
        })
      });

      break;
    }
  }

  // Broadcast message to everyone if it's a server-allowed message
  const isServerMessage = serverMessageSchema.safeParse(message);
  if (isServerMessage.success) {
    sendBroadcastMessage({ chatId, message: isServerMessage.data });
  }
};
