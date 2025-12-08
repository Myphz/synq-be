import { getMessaging } from "firebase-admin/messaging";
import { supabaseAdmin } from "../supabase/admin.js";

type SendNotificationParams = {
  userId: string;
  senderId: string;
  message: string;
  messageId: string;
  chatId: number;
};

export const sendNotification = async ({
  userId,
  senderId,
  message,
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
        body: message,
        ...(avatar && { imageUrl: avatar })
      },
      data: {
        chatId: chatId.toString(),
        messageId
      },
      android: {
        priority: "high",
        notification: {
          sound: "default",
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
