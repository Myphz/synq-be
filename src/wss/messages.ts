import { z } from "zod";

// This is a list of messages that the client OR the server may send.
const sendMessageSchema = z.object({
  type: z.literal("SEND_MESSAGE"),
  chatId: z.number(),
  data: z.object({
    content: z.string()
  })
});

// Test message
// {"type": "SEND_MESSAGE", "chatId": 1, "data": { "content": "mario" } }

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

export const messageSchema = z.discriminatedUnion("type", [
  sendMessageSchema,
  typingUpdateSchema,
  readMessageSchema
]);

export type Message = z.infer<typeof messageSchema>;
