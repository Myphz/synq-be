import { z } from "zod";

// This is a list of messages that the client OR the server may send.
const sendMessageSchema = z.object({
  type: z.literal("SEND_MESSAGE"),
  chatId: z.number(),
  data: z.object({
    content: z.string()
  })
});

const typingUpdateSchema = z.object({
  type: z.literal("UPDATE_TYPING"),
  chatId: z.number(),
  data: z.object({
    isTyping: z.boolean()
  })
});

const readMessageSchema = z.object({
  type: z.literal("READ_MESSAGE"),
  chatId: z.number(),
  data: z.object({
    messageId: z.string()
  })
});

export const message = z.discriminatedUnion("type", [
  sendMessageSchema,
  typingUpdateSchema,
  readMessageSchema
]);
