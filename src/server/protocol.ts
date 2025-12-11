import { z } from "zod";

const messageSchema = z.object({
  id: z.uuid(),
  sentAt: z.string(),
  senderId: z.string(),
  content: z.string(),
  isRead: z.boolean()
});

// ** SHARED MESSAGES ** (both client AND server may send these!)
const readMessageSchema = z.object({
  type: z.literal("READ_MESSAGE"),
  chatId: z.number(),
  data: z.object({
    messageId: z.uuid()
  })
});

const sharedMessagesSchema = z.discriminatedUnion("type", [readMessageSchema]);

// ** SERVER ONLY MESSAGES ** (Only the server sends these!)
const receiveMessageSchema = z.object({
  type: z.literal("RECEIVE_MESSAGE"),
  chatId: z.number(),
  userId: z.uuid(),
  data: z.object({
    id: z.uuid(),
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
          lastSeen: z.string().nullable(),
          avatarUrl: z.string().nullable()
        })
      )
    })
  )
});

const updateUserStatusSchema = z.object({
  type: z.literal("UPDATE_USER_STATUS"),
  userId: z.uuid(),
  chatId: z.number(),
  data: z.object({
    isOnline: z.boolean().optional(),
    isTyping: z.boolean().optional(),
    lastSeen: z.string().optional()
  })
});

const getMessagesSchema = z.object({
  type: z.literal("GET_MESSAGES"),
  chatId: z.number(),
  data: z.object({
    messages: z.array(messageSchema)
  })
});

const uploadPermitGrantedSchema = z.object({
  type: z.literal("UPLOAD_PERMIT_GRANTED"),
  data: z.object({
    signedUrl: z.string(),
    key: z.string()
  })
});

export const serverMessageSchema = sharedMessagesSchema.or(
  z.discriminatedUnion("type", [
    initialSyncSchema,
    updateUserStatusSchema,
    getMessagesSchema,
    receiveMessageSchema,
    uploadPermitGrantedSchema
  ])
);

// ** CLIENT ONLY MESSAGES ** (Only the client sends these!)

const updateUserTypingSchema = z.object({
  type: z.literal("UPDATE_USER_TYPING"),
  chatId: z.number(),
  data: z.object({
    isTyping: z.boolean()
  })
});

const sendMessageSchema = z.object({
  type: z.literal("SEND_MESSAGE"),
  chatId: z.number(),
  data: z.object({
    content: z.string(),
    image: z.url().optional()
  })
});

const requestMessagesSchema = z.object({
  type: z.literal("REQUEST_MESSAGES"),
  chatId: z.number()
});

const requestUploadSchema = z.object({
  type: z.literal("REQUEST_UPLOAD"),
  chatId: z.number()
});

export const clientMessageSchema = sharedMessagesSchema.or(
  z.discriminatedUnion("type", [
    updateUserTypingSchema,
    sendMessageSchema,
    requestMessagesSchema,
    requestUploadSchema
  ])
);

export type ClientMessage = z.infer<typeof clientMessageSchema>;
export type ServerMessage = z.infer<typeof serverMessageSchema>;
