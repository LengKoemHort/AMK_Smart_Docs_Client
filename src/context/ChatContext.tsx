"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { ChatMessage } from "@/types/message-type";
import { v4 as uuidv4 } from 'uuid';

interface ChatContextType {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  isChatStarted: boolean;
  setIsChatStarted: React.Dispatch<React.SetStateAction<boolean>>;
  currentSessionId: string | null;
  setCurrentSessionId: React.Dispatch<React.SetStateAction<string | null>>;
  isResponding: boolean;
  setIsResponding: React.Dispatch<React.SetStateAction<boolean>>;
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
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isResponding, setIsResponding] = useState(false);
  return (
    <ChatContext.Provider
      value={{
        messages,
        setMessages,
        isChatStarted,
        setIsChatStarted,
        currentSessionId,
        setCurrentSessionId,
        isResponding,
        setIsResponding,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};