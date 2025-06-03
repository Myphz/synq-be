import { getMessaging } from "firebase-admin/messaging";
import { supabaseAdmin } from "../supabase/admin.js";

type SendNotificationParams = {
  userId: string;
};

export const sendNotification = async ({ userId }: SendNotificationParams) => {
  const {
    data: { fcm_token: token }
  } = await supabaseAdmin
    .from("profiles")
    .select("fcm_token")
    .eq("id", userId)
    .single()
    .throwOnError();

  if (!token) return console.log("sendNotification(): no token");

  await getMessaging().send({
    token,
    notification: {
      title: "Test!",
      body: "sodjf"
    }
  });
};
