import { z } from "zod";

// ** SHARED MESSAGES ** (both client AND server may send these!)
const sendMessageSchema = z.object({
  type: z.literal("SEND_MESSAGE"),
  chatId: z.string().regex(/^\d+$/).or(z.number()),
  userId: z.string(),
  data: z.object({
    content: z.string()
  })
});

// Test message
// {"type": "SEND_MESSAGE", "chatId": 1, "userId": "4a71bb88-8d37-4b33-9231-4233aed3e9ab", "data": { "content": "mario" } }

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

// ** SERVER ONLY MESSAGES ** (Only the server sends these!)
const initialSyncSchema = z.object({
  type: z.literal("INITIAL_SYNC"),
  chats: z.array(
    z.object({
      chatId: z.number(),
      lastMessage: z
        .object({
          id: z.number(),
          senderId: z.string(),
          content: z.string(),
          timestamp: z.string(),
          isRead: z.boolean()
        })
        .or(z.null()),
      unreadMessagesCount: z.number(),
      members: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          username: z.string(),
          isTyping: z.boolean()
          // TODO: Add pfp
        })
      )
    })
  )
});

export const messageSchema = z.discriminatedUnion("type", [
  sendMessageSchema,
  updateUserStatusSchema,
  readMessageSchema,
  initialSyncSchema
]);

export type Message = z.infer<typeof messageSchema>;

export type ClientMessage = Exclude<Message, { type: "INITIAL_SYNC" }>;
