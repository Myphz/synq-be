import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../types/supabase.js";

export const getAllChatsForUser = async (
  supabaseClient: SupabaseClient<Database>
) => {
  const { data: userChats } = await supabaseClient
    .from("chats")
    .select("id")
    .throwOnError();

  return userChats.map((ch) => ch.id);
};

export const getChatMembers = async (
  supabaseClient: SupabaseClient<Database>,
  chatId: number
) => {
  const { data: userIds } = await supabaseClient
    .from("chats_members")
    .select("user_id")
    .eq("chat_id", chatId)
    .throwOnError();

  return userIds.map((id) => id.user_id);
};
