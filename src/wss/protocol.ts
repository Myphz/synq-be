import { z } from "zod";

// This is a list of messages that the client OR the server may send.
const sendMessageSchema = z.object({
  type: z.literal("SEND_MESSAGE"),
  chatId: z.string().regex(/^\d+$/).or(z.number()),
  data: z.object({
    content: z.string()
  })
});

// Test message
// {"type": "SEND_MESSAGE", "chatId": 1, "data": { "content": "mario" } }

const updateUserStatusSchema = z.object({
  type: z.literal("UPDATE_USER_STATUS"),
  userId: z.string(),
  chatId: z.string().regex(/^\d+$/).or(z.number()),
  data: z.object({
    isTyping: z.boolean().optional(),
    isOnline: z.boolean().optional()
  })
});

const readMessageSchema = z.object({
  type: z.literal("READ_MESSAGE"),
  chatId: z.string().regex(/^\d+$/).or(z.number()),
  data: z.object({
    messageId: z.string()
  })
});

export const messageSchema = z.discriminatedUnion("type", [
  sendMessageSchema,
  updateUserStatusSchema,
  readMessageSchema
]);

export type Message = z.infer<typeof messageSchema>;
