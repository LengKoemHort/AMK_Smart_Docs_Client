"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { ChatMessage } from "@/types/message-type";
import { UUID } from "crypto";

interface ChatContextType {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  isChatStarted: boolean;
  setIsChatStarted: React.Dispatch<React.SetStateAction<boolean>>;
  currentSessionId: UUID | null;
  setCurrentSessionId: React.Dispatch<React.SetStateAction<UUID | null>>;
  clearChat: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within ChatProvider");
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isChatStarted, setIsChatStarted] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<UUID | null>(null);

  const clearChat = () => {
    setMessages([]);
    setIsChatStarted(false);
    setCurrentSessionId(null);
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        setMessages,
        isChatStarted,
        setIsChatStarted,
        currentSessionId,
        setCurrentSessionId,
        clearChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};