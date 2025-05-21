import { getSupabaseUserClient, withAuth } from "../middlewares/auth.js";
import { Handler } from "../types/utils.js";
import { subscribeClientToChats } from "./chats.js";

export const wssHandler: Handler = withAuth(async (res, req) => {
  // 1. get socket client id (?)
  // 2. get supabase db user
  const supabaseClient = await getSupabaseUserClient(res, req);
  // 3. get all chats for user
  const { data: userChats } = await supabaseClient
    .from("chats")
    .select("id")
    .throwOnError();
  // 4. subscribe socket id to every chat
  subscribeClientToChats({ socketId: 0, chatIds: userChats });
  // 5. send some previous chat messages to the user? so that the FE can display them?
});
