"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useChatContext } from "@/context/ChatContext";
import { LucideMessageSquareText } from "lucide-react";
import { createNewChatSession } from "@/services/chats/chat.service";

export default function SidebarNewChatButton({
  minimized,
}: {
  minimized?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleNewChat = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const newSession = await createNewChatSession();
      router.push(`/c/${newSession.id}`);
    } catch (error: unknown) {
      console.error("Failed to create new chat:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={handleNewChat}
      className={`flex flex-row gap-2 rounded-lg transition-all duration-200 ease-in-out cursor-pointer hover:bg-[#A53C6F] hover:text-white transform items-center
      ${
        minimized
          ? "py-2 justify-center tooltip tooltip-right z-100"
          : "p-2 justify-start"
      } ${loading ? "opacity-50 pointer-events-none" : ""}`}
    >
      <span className="material-symbols-outlined">
        <LucideMessageSquareText />
      </span>
      {!minimized && "New chat"}
    </div>
  );
}
