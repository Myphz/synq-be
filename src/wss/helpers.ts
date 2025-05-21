/* eslint-disable @typescript-eslint/no-unused-vars */
import { connectedClients } from "./chats.js";

export const getConnectedClientsForChat = (chatId: number) =>
  Object.entries(connectedClients)
    .filter(([_, data]) => data.chats.includes(Number(chatId)))
    .map(([socketId, _]) => socketId);
