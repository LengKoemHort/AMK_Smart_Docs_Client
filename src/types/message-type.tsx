export type Sender = "user" | "bot";

export interface ChatMessage {
  sender: "user" | "bot";
  id: string;
  content: string;
  timestamp: string;
  isTyping?: boolean;

  docId?: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  published_date?: string;
  hasReferences?: boolean;

  voiceBlob?: Blob;
  voiceUrl?: string;
  voiceDuration?: number;
  isVoice?: boolean;
}
