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

export const send = async ({ ws, message }: SendMessageParams) => {
  try {
    ws.send(JSON.stringify(message));
  } catch {
    try {
      const { user } = ws.getUserData();
      connectedClients.delete(user.id);
    } catch {}
  }
};
