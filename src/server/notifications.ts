import { getMessaging } from "firebase-admin/messaging";
import { supabaseAdmin } from "../supabase/admin.js";

type SendNotificationParams = {
  userId: string;
  senderId: string;
  content: string;
  image?: string;
  messageId: string;
  chatId: number;
};

const NOTIFICATION_CHANNEL_ID = "notifications";

export const sendNotification = async ({
  userId,
  senderId,
  content,
  image,
  messageId,
  chatId
}: SendNotificationParams) => {
  const {
    data: { fcm_token: token }
  } = await supabaseAdmin
    .from("profiles")
    .select("fcm_token")
    .eq("id", userId)
    .single()
    .throwOnError();

  if (!token) return;

  const {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    data: { name, avatar_url: avatar }
  } = await supabaseAdmin
    .from("profiles")
    .select("name, avatar_url")
    .eq("id", senderId)
    .single()
    .throwOnError();

  try {
    await getMessaging().send({
      token,
      notification: {
        title: name,
        body: content,
        ...(image && { imageUrl: image })
      },
      data: {
        chatId: chatId.toString()
      },
      android: {
        collapseKey: chatId.toString(),
        priority: "high",
        notification: {
          channelId: NOTIFICATION_CHANNEL_ID,
          tag: messageId,
          icon: "notification_icon"
        }
      },
      apns: {
        payload: {
          aps: {
            sound: "default"
          }
        }
      }
    });
  } catch (err) {
    console.log(`NOTIFICATION: Failed for user ${userId}`, err);
  }
};
