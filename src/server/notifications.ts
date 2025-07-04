import { getMessaging } from "firebase-admin/messaging";
import { supabaseAdmin } from "../supabase/admin.js";

type SendNotificationParams = {
  userId: string;
  senderId: string;
  message: string;
  chatId: number;
};

export const sendNotification = async ({
  userId,
  senderId,
  message,
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
        chatId: chatId.toString()
      },
      // Add default sound
      android: {
        priority: "high",
        notification: {
          sound: "default"
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
