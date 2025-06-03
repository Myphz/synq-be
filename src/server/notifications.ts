import { getMessaging } from "firebase-admin/messaging";
import { supabaseAdmin } from "../supabase/admin.js";

type SendNotificationParams = {
  userId: string;
};

export const sendNotification = async ({ userId }: SendNotificationParams) => {
  try {
    const {
      data: { fcm_token: token }
    } = await supabaseAdmin
      .from("profiles")
      .select("fcm_token")
      .eq("id", userId)
      .single()
      .throwOnError();

    if (!token) return console.log("sendNotification(): no token");

    const res = await getMessaging().send({
      token,
      notification: {
        title: "Test!",
        body: "sodjf"
      }
    });
    console.log("Notification sent!", res);
  } catch (err) {
    console.log("Notification error", err);
  }
};
