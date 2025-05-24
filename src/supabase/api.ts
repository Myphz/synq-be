import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../types/supabase.js";

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

export const getInitialSyncData = async (
  supabaseClient: SupabaseClient<Database>
) => {
  const { data } = await supabaseClient
    .rpc("get_initial_sync_data")
    .throwOnError();

  return data as {
    chats: Array<{
      chat_id: number;
      chat_name: string | null;
      chat_created_at: string;
      last_message: {
        id: string;
        sender_id: string;
        content: string;
        timestamp: string;
        is_read: boolean;
      } | null;
      unread_messages_count: number;
      members: Array<{
        id: string;
        name: string;
        username: string;
        last_seen: string | null;
      }>;
    }>;
  };
};
