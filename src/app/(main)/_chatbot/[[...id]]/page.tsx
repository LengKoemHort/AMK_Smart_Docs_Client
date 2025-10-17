"use client";

import { ChatMessage } from "@/types/message-type";
import React, { useState, useRef, useEffect } from "react";
import ChatInput from "../(components)/ChatInput";
import MessageCard from "../(components)/message-card";
import { useParams, useRouter } from "next/navigation";
import transformBackendMessage from "@/lib/chat-message-transform";
import BotMultiMessageCard from "../(components)/bot-multi-message-card";
import { useMutation } from "@tanstack/react-query";
import { askBot, getChatSessionMessages } from "@/services/chats/chat.service";
import { useChatContext } from "@/context/ChatContext";
import { useUser } from "@/context/UserContext";

const useSidebarState = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const checkSidebarState = () => {
      const sidebarElement = document.querySelector('[class*="w-[240px]"]');
      if (sidebarElement) {
        setSidebarOpen(sidebarElement.classList.contains("w-[240px]"));
      }
    };

    checkSidebarState();
    const observer = new MutationObserver(checkSidebarState);
    const sidebarContainer = document.querySelector(
      ".flex.h-screen > div:first-child"
    );

    if (sidebarContainer) {
      observer.observe(sidebarContainer, {
        attributes: true,
        attributeFilter: ["class"],
      });
    }

    return () => observer.disconnect();
  }, []);

  return sidebarOpen;
};

export default function Chatbot() {
  const {
    messages,
    setMessages,
    isChatStarted,
    setIsChatStarted,
    currentSessionId,
    setCurrentSessionId,
    isResponding,
    setIsResponding,
  } = useChatContext();

  const { user: currentUser, hasDownloadPrivilege } = useUser();

  const [windowWidth, setWindowWidth] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sidebarOpen = useSidebarState();
  const params = useParams();
  const sessionId = params.id;

  const sendMessageMutation = useMutation({
    mutationFn: ({ text, formData }: { text: string; formData?: FormData }) => {
      const sessionIdString = Array.isArray(sessionId) ? sessionId[0] : sessionId;
      return askBot(sessionIdString ?? null, text, formData);
    },
    onSuccess: (data) => {
      const backendMessages = data.body;
      setMessages((prev: ChatMessage[]) => {
        const withoutTyping = prev.filter((msg) => msg.id !== "bot-typing");
        const existingUserMessage = withoutTyping.find(
          (msg) => msg.id === "user-input"
        );
        const chatMessages = transformBackendMessage(
          backendMessages,
          existingUserMessage
        );
        const withoutUserInput = withoutTyping.filter(
          (msg) => msg.id !== "user-input"
        );
        return [...withoutUserInput, ...chatMessages];
      });
    },
    onError: () => {
      setMessages((prev) =>
        prev.filter((msg) => !["bot-typing", "user-input"].includes(msg.id))
      );
      alert("Failed to send message");
    },
  });

  useEffect(() => {
    const loadSession = async () => {
      if (!params.id || currentSessionId === params.id) return;

      try {
        const data = await getChatSessionMessages(params.id as string);
        const backendMessages = data?.body?.messages || [];
        const chatMessages: ChatMessage[] = backendMessages.flatMap(
          transformBackendMessage
        );
        setMessages(chatMessages);
        setIsChatStarted(chatMessages.length > 0);
        setCurrentSessionId(Array.isArray(params.id) ? params.id[0] : params.id);
      } catch (err) {
        console.error("Error loading session:", err);
        setMessages([]);
        setIsChatStarted(false);
        setCurrentSessionId(Array.isArray(params.id) ? params.id[0] : params.id);
      }
    };
    loadSession();
  }, [
    params.id,
    currentSessionId,
    setMessages,
    setIsChatStarted,
    setCurrentSessionId,
  ]);

  const handleSendMessage = async (
    text: string,
    voiceBlob?: Blob,
    voiceDuration?: number,
    documentType?: string
  ) => {
    console.log("=== Chatbot handleSendMessage Debug ===");
    console.log("Text received:", text);
    console.log("Voice blob:", voiceBlob);
    console.log("Voice duration:", voiceDuration);
    console.log("Document type received:", documentType);

    const timestamp = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const newUserMessage: ChatMessage = {
      id: "user-input",
      sender: "user",
      content: text,
      timestamp,
      voiceBlob,
      isVoice: !!voiceBlob,
      voiceDuration: voiceDuration || 0,
    };

    const typingMessage: ChatMessage = {
      id: "bot-typing",
      sender: "bot",
      content: "...",
      timestamp,
      isTyping: true,
    };

    setMessages((prev) => [...prev, newUserMessage, typingMessage]);
    setIsChatStarted(true);

    const formData = new FormData();
    formData.append("question", text);
    formData.append("input_type", voiceBlob ? "voice" : "text");

    if (voiceBlob) formData.append("voice_file", voiceBlob);
    if (documentType) {
      formData.append("document_type", documentType);
      console.log("Added document_type to formData:", documentType);
    }

    setIsResponding(true);
    await sendMessageMutation.mutateAsync({ text, formData })
      .finally(() => setIsResponding(false));
  };
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const groupedMessages: Array<{ user: ChatMessage; bots: ChatMessage[] }> = [];
  let i = 0;
  while (i < messages.length) {
    if (messages[i].sender === "user") {
      const user = messages[i];
      const bots: ChatMessage[] = [];
      let j = i + 1;
      while (j < messages.length && messages[j].sender === "bot") {
        bots.push(messages[j]);
        j++;
      }
      groupedMessages.push({ user, bots });
      i = j;
    } else {
      i++;
    }
  }

  const getContentWidth = () => {
    const isMobile = windowWidth < 768;
    const isTablet = windowWidth >= 768 && windowWidth < 1024;

    if (isMobile) return "w-full px-6 sm:px-8";
    if (isTablet) return "w-full max-w-3xl mx-auto px-16";
    return "w-full max-w-4xl mx-auto px-20 xl:px-24";
  };

  return (
    <div className="flex flex-col h-full relative bg-base-200 pt-16 md:pt-0">
      {!isChatStarted && (
        <div className="flex-1 flex items-center justify-center px-6 sm:px-8 md:px-16 lg:px-20 xl:px-24 py-4 sm:py-6">
          <div className="w-full max-w-2xl mx-auto text-center">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold mb-8 text-base-content leading-tight">
              What do you want to know?
            </h1>
            <div className="w-full">
              <ChatInput onSendMessage={handleSendMessage} />
            </div>
          </div>
        </div>
      )}

      {isChatStarted && (
        <>
          <div className="flex-1 overflow-y-auto bg-gradient-to-b from-base-100 to-transparent">
            <div className={`${getContentWidth()} py-12 md:py-16 space-y-12`}>
              {groupedMessages.map(({ user, bots }) => (
                <React.Fragment key={user.id}>
                  <MessageCard
                    message={user}
                    hasDownloadPrivilege={hasDownloadPrivilege}
                  />
                  {bots.length > 1 ? (
                    <BotMultiMessageCard messages={bots} />
                  ) : bots.length === 1 ? (
                    <MessageCard
                      message={bots[0]}
                      hasDownloadPrivilege={hasDownloadPrivilege}
                    />
                  ) : null}
                </React.Fragment>
              ))}
              <div ref={messagesEndRef} />
              <div className="h-8" />
            </div>
          </div>

          <div className="border-none shadow-lg bg-transparent">
            <div className={`${getContentWidth()} pb-4 md:pb-6`}>
              <ChatInput onSendMessage={handleSendMessage} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}