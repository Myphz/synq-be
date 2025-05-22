import { app } from "../app.js";
import { AuthSocket } from "../types/utils.js";
import { Message } from "./protocol.js";

type SendBroadcastMessageParams = {
  ws?: AuthSocket;
  message: Message;
  chatId: string | number;
};

export const sendBroadcastMessage = ({
  ws,
  message,
  chatId
}: SendBroadcastMessageParams) =>
  (ws || app).publish(chatId.toString(), JSON.stringify(message), false);
