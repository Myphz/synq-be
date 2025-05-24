import { AuthSocket } from "../types/utils.js";

export const connectedClients = new Map<
  string,
  {
    ws: AuthSocket;
    chats: {
      id: string;
      isTyping: boolean;
    }[];
  }
>();
