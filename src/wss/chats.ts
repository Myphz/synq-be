import { app } from "../app.js";
import { getPartecipantsForChat } from "../supabase/api.js";
import { AuthSocket } from "../types/utils.js";
import { connectedClients } from "./events.js";
import { Message } from "./messages.js";

export const processMessage = async (ws: AuthSocket, message: Message) => {
  const { chatId } = message;
  const { user, supabaseClient } = ws.getUserData();
  // Client is trying to send a message to a new chat
  if (!ws.getTopics().includes(chatId.toString())) {
    // subscribe all chat partecipants to this chat
    const partecipants = await getPartecipantsForChat(supabaseClient, chatId);
    // client is trying to send message to a chat he doesn't have access to?
    if (!partecipants.includes(user.id)) throw new Error("TODO");

    partecipants.forEach((userId) => {
      const wsClient = connectedClients.get(userId);
      if (!wsClient) return;
      wsClient.subscribe(chatId.toString());
    });
  }

  switch (message.type) {
    case "SEND_MESSAGE": {
      const { content } = message.data;

      supabaseClient
        .from("messages")
        .insert({ chat_id: chatId, text: content })
        .then();

      console.log("send notification to offline guys");
      break;
    }
  }

  // Broadcast message to everyone
  app.publish(chatId.toString(), JSON.stringify(message));
};
