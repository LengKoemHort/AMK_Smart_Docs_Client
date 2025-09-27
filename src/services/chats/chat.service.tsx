import API from "@/lib/axios";
import { UUID } from "crypto";
import { AxiosError } from "axios";

// Type guard to check if error is an axios error
function isAxiosError(error: unknown): error is AxiosError {
  return typeof error === "object" && error !== null && "response" in error;
}

export async function createNewChatSession() {
  try {
    const res = await API.post("/api/chats/sessions/");
    const data = res.data.body;

    return data;
  } catch (error: unknown) {
    console.error("Error creating chat sessions:", error);
    throw error;
  }
}

export async function getChatSessionMessages(id: string) {
  try {
    const res = await API.get(`/api/chats/sessions/${id}/`);
    return res.data;
  } catch (error: unknown) {
    console.error("Error fetching chat sessions:", error);

    // For 404 errors (session doesn't exist yet), return empty structure
    if (isAxiosError(error) && error.response?.status === 404) {
      return {
        body: {
          messages: [],
        },
      };
    }

    throw error;
  }
}

export async function askBot(
  sessionId: UUID | null,
  message: string,
  voice_file?: FormData
) {
  try {
    const url = sessionId
      ? `/api/chats/session/messages/?session_id=${sessionId}` // with session id
      : `/api/chats/session/messages/`; // no session id, creating new session before asking question

    console.log("=== askBot Service Debug ===");
    console.log("Session ID:", sessionId);
    console.log("Message:", message);
    console.log("URL:", url);

    if (voice_file) {
      console.log("Sending FormData with voice file:");
      for (const [key, value] of voice_file.entries()) {
        if (value instanceof File) {
          console.log(`${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }
      
      const res = await API.post(url, voice_file);
      console.log("Answer 1 (with voice): " + JSON.stringify(res.data));
      return res.data;
    } else {
      console.log("Sending text-only request:");
      const payload = {
        question: message,
      };
      console.log("Payload:", payload);
      
      const res = await API.post(url, payload);
      console.log("Answer 2 (text only): " + JSON.stringify(res.data));
      return res.data;
    }
  } catch (error: unknown) {
    console.log("error creating response from bot", error);
    throw error;
  }
}

export async function searchChatSessions(query: string) {
  try {
    // Use existing endpoint to get all sessions, then filter client-side
    const res = await API.get("/api/chats/sessions/");
    const allSessions = res.data.body.results || [];

    if (!query.trim()) {
      return allSessions;
    }

    // Client-side filtering by title
    const filteredSessions = allSessions.filter(
      (session: any) =>
        session.title &&
        session.title.toLowerCase().includes(query.toLowerCase())
    );

    return filteredSessions;
  } catch (error: unknown) {
    console.error("Error searching chat sessions:", error);
    return [];
  }
}

export async function getChatSessions() {
  try {
    const res = await API.get("/api/chats/sessions/");
    return res.data.body.results || [];
  } catch (error: unknown) {
    console.error("Error fetching chat sessions:", error);
    return [];
  }
}

// Simple cache for session details to avoid repeated API calls
const sessionDetailsCache = new Map<string, any>();

export async function searchChatSessionsWithContent(query: string) {
  try {
    // Get all sessions first
    const sessions = await getChatSessions();

    if (!query.trim()) {
      return sessions;
    }

    const searchTerm = query.toLowerCase();
    const matchingSessions = [];

    // Search through session titles first (quick search)
    for (const session of sessions) {
      let isMatch = false;

      // Check session title
      if (session.title && session.title.toLowerCase().includes(searchTerm)) {
        isMatch = true;
      }

      // If not matched by title, search through messages (slower but comprehensive)
      if (!isMatch) {
        try {
          // Check cache first
          let sessionDetails;
          if (sessionDetailsCache.has(session.id)) {
            sessionDetails = sessionDetailsCache.get(session.id);
          } else {
            sessionDetails = await getChatSessionMessages(session.id);
            // Cache for 5 minutes
            sessionDetailsCache.set(session.id, sessionDetails);
            setTimeout(
              () => sessionDetailsCache.delete(session.id),
              5 * 60 * 1000
            );
          }

          const messages = sessionDetails.body?.messages || [];

          // Search through message content
          for (const message of messages) {
            if (
              (message.question &&
                message.question.toLowerCase().includes(searchTerm)) ||
              (message.answer &&
                typeof message.answer === "string" &&
                message.answer.toLowerCase().includes(searchTerm)) ||
              (Array.isArray(message.answer) &&
                message.answer.some(
                  (ans: any) =>
                    ans.text && ans.text.toLowerCase().includes(searchTerm)
                ))
            ) {
              isMatch = true;
              break;
            }
          }
        } catch (error: unknown) {
          console.error(
            `Error fetching messages for session ${session.id}:`,
            error
          );
          // Continue with other sessions even if one fails
        }
      }

      if (isMatch) {
        matchingSessions.push(session);
      }
    }

    return matchingSessions;
  } catch (error: unknown) {
    console.error("Error searching chat sessions with content:", error);
    return [];
  }
}