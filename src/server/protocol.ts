import { z } from "zod";

const messageSchema = z.object({
  id: z.string().uuid(),
  sentAt: z.string(),
  senderId: z.string(),
  content: z.string(),
  isRead: z.boolean()
});

// ** SHARED MESSAGES ** (both client AND server may send these!)
const readMessageSchema = z.object({
  type: z.literal("READ_MESSAGE"),
  chatId: z.string().regex(/^\d+$/).or(z.number()),
  data: z.object({
    messageId: z.string().uuid()
  })
});

const sharedMessagesSchema = z.discriminatedUnion("type", [readMessageSchema]);

// ** SERVER ONLY MESSAGES ** (Only the server sends these!)
const receiveMessageSchema = z.object({
  type: z.literal("RECEIVE_MESSAGE"),
  chatId: z.string().regex(/^\d+$/).or(z.number()),
  userId: z.string().uuid(),
  data: z.object({
    id: z.string().uuid(),
    content: z.string(),
    sentAt: z.string()
  })
});

const initialSyncSchema = z.object({
  type: z.literal("INITIAL_SYNC"),
  chats: z.array(
    z.object({
      name: z.string().nullable(),
      chatId: z.number(),
      lastMessage: messageSchema.nullable(),
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
  userId: z.string().uuid(),
  chatId: z.string().regex(/^\d+$/).or(z.number()),
  data: z.object({
    isOnline: z.boolean().optional(),
    isTyping: z.boolean().optional(),
    lastSeen: z.string().optional()
  })
});

const getMessagesSchema = z.object({
  type: z.literal("GET_MESSAGES"),
  chatId: z.string().regex(/^\d+$/).or(z.number()),
  data: z.object({
    messages: z.array(messageSchema)
  })
});

export const serverMessageSchema = sharedMessagesSchema.or(
  z.discriminatedUnion("type", [
    initialSyncSchema,
    updateUserStatusSchema,
    getMessagesSchema,
    receiveMessageSchema
  ])
);

// ** CLIENT ONLY MESSAGES ** (Only the client sends these!)

const updateUserTypingSchema = z.object({
  type: z.literal("UPDATE_USER_TYPING"),
  chatId: z.string().regex(/^\d+$/).or(z.number()),
  data: z.object({
    isTyping: z.boolean()
  })
});

const sendMessageSchema = z.object({
  type: z.literal("SEND_MESSAGE"),
  chatId: z.string().regex(/^\d+$/).or(z.number()),
  data: z.object({
    content: z.string()
  })
});

const requestMessagesSchema = z.object({
  type: z.literal("REQUEST_MESSAGES"),
  chatId: z.string().regex(/^\d+$/).or(z.number())
});

export const clientMessageSchema = sharedMessagesSchema.or(
  z.discriminatedUnion("type", [
    updateUserTypingSchema,
    sendMessageSchema,
    requestMessagesSchema
  ])
);

export type ClientMessage = z.infer<typeof clientMessageSchema>;
export type ServerMessage = z.infer<typeof serverMessageSchema>;
