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

const updateUserTypingSchema = z.object({
  type: z.literal("UPDATE_USER_TYPING"),
  userId: z.string(),
  chatId: z.string().regex(/^\d+$/).or(z.number()),
  data: z.object({
    isTyping: z.boolean().optional()
  })
});

const readMessageSchema = z.object({
  type: z.literal("READ_MESSAGE"),
  chatId: z.string().regex(/^\d+$/).or(z.number()),
  data: z.object({
    messageId: z.number()
  })
});

const sharedMessagesSchema = z.discriminatedUnion("type", [
  sendMessageSchema,
  updateUserTypingSchema,
  readMessageSchema
]);

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
        .nullable(),
      unreadMessagesCount: z.number(),
      members: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          username: z.string(),
          isOnline: z.boolean(),
          isTyping: z.boolean(),
          lastSeen: z.string().nullable()
          // TODO: Add pfp
        })
      )
    })
  )
});

const updateUserStatusSchema = z.object({
  type: z.literal("UPDATE_USER_STATUS"),
  userId: z.string(),
  chatId: z.string().regex(/^\d+$/).or(z.number()),
  data: z.object({
    isOnline: z.boolean().optional(),
    lastSeen: z.string().optional()
  })
});

export const serverMessageSchema = sharedMessagesSchema.or(
  z.discriminatedUnion("type", [initialSyncSchema, updateUserStatusSchema])
);

// ** CLIENT ONLY MESSAGES ** (Only the client sends these!)
const requestMessagesSchema = z.object({
  type: z.literal("REQUEST_MESSAGES"),
  chatId: z.string().regex(/^\d+$/).or(z.number())
});

export const clientMessageSchema = sharedMessagesSchema.or(
  z.discriminatedUnion("type", [requestMessagesSchema])
);

export const messageSchema = z.discriminatedUnion("type", [
  sendMessageSchema,
  updateUserStatusSchema,
  readMessageSchema,
  initialSyncSchema
]);

export type ClientMessage = z.infer<typeof clientMessageSchema>;
export type ServerMessage = z.infer<typeof serverMessageSchema>;

// Test message
// {"type": "SEND_MESSAGE", "chatId": 1, "userId": "4a71bb88-8d37-4b33-9231-4233aed3e9ab", "data": { "content": "mario" } }
