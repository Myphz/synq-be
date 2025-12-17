import { v4 as uuidv4 } from "uuid";
import { getPresignedUrlForUpload } from "../r2/upload.js";
import { getChatMembers } from "../supabase/api.js";
import { AuthSocket } from "../types/utils.js";
import { connectedClients } from "./clients.js";
import { onNewConnection } from "./handlers.js";
import { getConnectedClient, send, sendBroadcastMessage } from "./helpers.js";
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
  const chatId = message.chatId;
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
      const { content, image } = message.data;
      const processedContent = content.trim();
      const now = new Date().toISOString();
      const id = uuidv4();

      supabaseClient
        .from("messages")
        .insert({
          id,
          chat_id: chatId,
          ...(image && { image_url: image }),
          text: processedContent,
          created_at: now
        })
        .then();

      const socketMessage = {
        type: "RECEIVE_MESSAGE",
        userId: user.id,
        chatId,
        data: {
          id,
          content: processedContent,
          ...(image && { image }),
          sentAt: now
        }
      } satisfies ServerMessage;

      sendBroadcastMessage({ chatId, message: socketMessage });

      const members = await getChatMembers(supabaseClient, chatId);

      // Make sure other online members are subscribed to this chat
      // (they may not be subscribed if it's a new chat - they may not know of this chat!)
      const onlineMembersNotSubscribed = members.filter((member) => {
        if (member === user.id) return false;

        const userData = connectedClients.get(member);
        if (!userData) return false;

        return userData.ws.isSubscribed(chatId.toString());
      });

      if (onlineMembersNotSubscribed.length) {
        onlineMembersNotSubscribed.forEach((member) => {
          const ws = connectedClients.get(member)!.ws;
          // Re-initialize client to make sure he has the latest updates
          onNewConnection(ws);
        });
      }

      // Send notification to offline members
      const offlineMembers = members.filter(
        (member) => member !== user.id && !connectedClients.has(member)
      );

      offlineMembers.forEach((member) =>
        sendNotification({
          userId: member,
          content,
          image,
          messageId: id,
          senderId: user.id,
          chatId
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
        .limit(5000)
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
            ...(msg.image_url && { image: msg.image_url }),
            isRead: msg.is_read || false
          }))
        }
      } satisfies ServerMessage;

      send({ ws, message, userId: user.id });

      break;
    }

    case "REQUEST_UPLOAD": {
      const { signedUrl, key } = await getPresignedUrlForUpload({
        keyPrefix: chatId.toString(),
        contentType: "image/webp"
      });

      const message = {
        type: "UPLOAD_PERMIT_GRANTED",
        data: { signedUrl, key }
      } satisfies ServerMessage;

      send({ ws, message, userId: user.id });
      break;
    }
  }

  // Broadcast message if the client message is also a server-allowed message
  const { success: isServerMessage, data: serverMessage } =
    serverMessageSchema.safeParse(message);
  if (isServerMessage) sendBroadcastMessage({ chatId, message: serverMessage });
};
