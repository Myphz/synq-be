import { z } from "zod";
import { event } from "./events.js";
import { getConnectedClientsForChat } from "./helpers.js";

type SocketId = string;

export const connectedClients: Record<
  SocketId,
  {
    chats: number[];
    isTyping?: boolean;
  }
> = {};

type SubscribeClientToChatParams = { socketId: number; chatIds: number[] };

export const subscribeClientToChats = ({
  socketId,
  chatIds
}: SubscribeClientToChatParams) => {
  connectedClients[socketId] = { chats: chatIds };
};

type ProcessMessageParams = {
  socketId: number;
  message: z.infer<typeof event>;
};

export const processMessage = ({ socketId, message }: ProcessMessageParams) => {
  const client = connectedClients[socketId];
  if (!client) throw new Error(`processMessage: client ${socketId} not found!`);
  const { chatId } = message;
  const affectedClients = getConnectedClientsForChat(chatId);

  switch (message.type) {
    case "SEND_MESSAGE": {
      // add it to supabase & send notification to not-currently-connected chat partecipants
      console.log("ok");
      break;
    }

    case "UPDATE_TYPING": {
      // Just update the client
      connectedClients[socketId].isTyping = message.data.isTyping;
      console.log("ok");

      break;
    }
  }

  // broadcast the same exact message to affectedClients
};
