import { ChatMessage } from "@/types/message-type";

export default function transformBackendMessage(
  msg: any,
  existingUserMessage?: ChatMessage
): ChatMessage[] {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const isVoiceInput = msg.input_data?.input_type === "voice";
  const voiceFileUrl = msg.input_data?.voice_file;
  const transcribedText = msg.input_data?.content || msg.question;

  // Only define if voice input exists
  let constructedVoiceUrl: string | undefined = undefined;
  if (isVoiceInput && voiceFileUrl) {
    // Add /media/protected prefix to the voice file path
    constructedVoiceUrl = `${API_BASE_URL}/${voiceFileUrl}`;
  }

  // Debug logging for voice (including transcribed text)
  if (isVoiceInput) {
    console.log("Voice input detected:", {
      originalPath: voiceFileUrl,
      constructedUrl: constructedVoiceUrl,
      voiceDuration: msg.input_data?.voice_duration,
      transcribedText: transcribedText,
      hasExistingMessage: !!existingUserMessage,
    });
    console.log("🎤 Transcribed Text:", transcribedText);
  }

  // Build user message
  const userMsg: ChatMessage = {
    id: `${msg.id}-q`,
    sender: "user",
    content: isVoiceInput ? "" : msg.question, // Empty content for voice messages (no transcribed text in UI)
    timestamp: new Date(msg.created_at).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    isVoice: isVoiceInput,
    // For voice messages: use server URL but keep frontend duration
    voiceUrl: constructedVoiceUrl,
    voiceDuration:
      existingUserMessage?.voiceDuration ||
      msg.input_data?.voice_duration ||
      undefined,
  };

  const answer = msg.answer;
  const NO_DOCUMENT_MESSAGE = "No relevant information found. Please try again.";

  // If bot sends multiple chunks/files
  if (answer && Array.isArray(answer)) {
    const botMsgs: ChatMessage[] = answer.map((item: any, idx: number) => {
      const fileName = item.file_name;
      const fileExtension = fileName ? fileName.split('.').pop()?.toLowerCase() : undefined;
      return {
        id: `${msg.id}-a-${idx}`,
        sender: "bot",
        content: (item.text || item.answer || "").replace(/ - /g, "\n- "),
        timestamp: userMsg.timestamp,
        fileName: fileName,
        fileUrl: fileName
          ? `${API_BASE_URL}/media/protected/documents/${fileName}`
          : undefined,
        docId: item.file_id || item.doc_id,
        published_date: item.published_date || undefined,
        fileType: fileExtension,
        hasReferences: true,
      };
    });
    return [userMsg, ...botMsgs];
  }

  // If bot sends single string
  if (typeof answer === "string" && answer.trim() !== "") {
    const hasReferences = answer !== NO_DOCUMENT_MESSAGE;
    const botMsg: ChatMessage = {
      id: `${msg.id}-a`,
      sender: "bot",
      content: answer,
      timestamp: userMsg.timestamp,
      hasReferences: hasReferences,
    };
    return [userMsg, botMsg];
  }

  // Only user message (e.g., waiting for bot)
  return [userMsg];
}
