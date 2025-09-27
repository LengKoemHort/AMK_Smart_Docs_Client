import API from "@/lib/axios";
import { ChatSession } from "@/types/chat-session-type";

export async function getChatHistory(page: number = 10, per_page: number = 1) {
  try {
    const res = await API.get(
      `/api/chats/sessions/?page=${page}&page_size=${per_page}`
    );

    const raw = res.data.body.results;

    const mapped = raw.map((s: ChatSession) => ({
      id: s.id,
      title: s.title || "Untitled",
      user: s.user,
      created_at: s.created_at,
      message_count: s.message_count,
    }));

    return mapped;
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return [];
  }
}

export async function updateChatHistory(session_id: string, title: string) {
  try {
    const res = await API.patch(`/api/chats/sessions/${session_id}/rename/`, {
      title,
    });
    console.log("updated session history title: " + title);
    return res.data;
  } catch (error) {
    console.error("Error updating chat history:", error);
    return;
  }
}

export async function deleteChatHistory(session_id: string) {
  try {
    const res = await API.delete(`/api/chats/sessions/${session_id}/delete/`);
    console.log("chat session deleted");
    return res.data;
  } catch (error) {
    console.error("Error deleting chat history:", error);
    return;
  }
}
