import { getMessaging } from "firebase-admin/messaging";
import { supabaseAdmin } from "../supabase/admin.js";

type SendNotificationParams = {
  userId: string;
  message: string;
};

export const sendNotification = async ({
  userId,
  message
}: SendNotificationParams) => {
  const { data } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single()
    .throwOnError();

  const { fcm_token: token, name } = data;
  if (!token) return;

  await getMessaging().send({
    token,
    notification: {
      title: name,
      body: message
      // TODO: Add image_url
    }
  });
};
