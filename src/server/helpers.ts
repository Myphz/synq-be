import { app } from "../app.js";
import { AuthSocket } from "../types/utils.js";
import { connectedClients } from "./clients.js";
import { ServerMessage } from "./protocol.js";

type SendBroadcastMessageParams = {
  ws?: AuthSocket;
  message: ServerMessage;
  chatId: number;
};

type SendMessageParams = {
  ws: AuthSocket;
  message: ServerMessage;
  userId?: string;
};

type SubscribeParams = {
  ws: AuthSocket;
  chatId: number;
  userId?: string;
};

export const sendBroadcastMessage = ({
  ws,
  message,
  chatId
}: SendBroadcastMessageParams) =>
  (ws || app).publish(chatId.toString(), JSON.stringify(message), false);

export const getConnectedClient = (id: string) => {
  const ret = connectedClients.get(id);
  if (!ret) throw new Error("getConnectedClient: can't find client!");
  return ret;
};

export const send = ({ ws, message, userId }: SendMessageParams) => {
  try {
    ws.send(JSON.stringify(message));
    return true;
  } catch {
    try {
      const id = userId || ws.getUserData().user.id;
      connectedClients.delete(id);
    } catch {}
  }
};

export const subscribe = ({ ws, chatId, userId }: SubscribeParams) => {
  try {
    if (ws.isSubscribed(chatId.toString())) return true;

    ws.subscribe(chatId.toString());
    return true;
  } catch {
    try {
      const id = userId || ws.getUserData().user.id;
      connectedClients.delete(id);
    } catch {}
  }
};
