"use client";

import React, { useEffect, useState, useRef } from "react";
import { MessageSquareText, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  getChatSessions,
  searchChatSessionsWithContent,
} from "@/services/chats/chat.service";
import { ChatSession } from "@/types/chat-session-type";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}
 
export default function SearchModal({
  isOpen,
  onClose,
}: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ChatSession[]>([]);
  const [recentSessions, setRecentSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Load recent sessions when modal opens
  useEffect(() => {
    if (isOpen) {
      loadRecentSessions();
      // Focus search input when modal opens
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch(searchQuery);
      } else {
        setSearchResults([]);
        setSelectedIndex(-1);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const displaySessions = searchQuery.trim()
        ? searchResults
        : recentSessions;

      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < displaySessions.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > -1 ? prev - 1 : -1));
      } else if (e.key === "Enter" && selectedIndex >= 0) {
        e.preventDefault();
        handleSessionClick(displaySessions[selectedIndex].id);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, selectedIndex, searchQuery, searchResults.length, recentSessions.length]);

  const loadRecentSessions = async () => {
    try {
      const sessions = await getChatSessions();
      setRecentSessions(sessions.slice(0, 10));
    } catch (error) {
      console.error("Error loading recent sessions:", error);
    }
  };

  const performSearch = async (query: string) => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const sessions = await searchChatSessionsWithContent(query);
      setSearchResults(sessions);
    } catch (error) {
      console.error("Error searching sessions:", error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSessionClick = (sessionId: string) => {
    router.push(`/c/${sessionId}`);
    onClose();
  };

  const handleNewChat = () => {
    router.push("/c");
    onClose();
  };

  const getSessionGroupLabel = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil(Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Today";
    if (diffDays <= 7) return "Last 7 Days";
    if (diffDays <= 30) return "Last 30 Days";
    return "Older";
  };

  return (
    <dialog
      id="search_modal"
      className="modal z-[9999]"
      open={isOpen}
      onClose={onClose}
    >
      <div className="modal-box">
        <button
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          onClick={onClose}
        >
          ✕
        </button>
        <h3 className="font-bold mb-4 text-base">Search Chats</h3>

        {/* Search input box */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A53C6F] focus:border-transparent"
          />
        </div>

        {/* New chat button */}
        <button
          onClick={handleNewChat}
          className="flex items-center gap-3 w-full p-3 bg-[#EDD8E2] rounded-lg text-left mb-4"
        >
          <div className="w-6 h-6 text-[#A53C6F] rounded flex items-center justify-center flex-shrink-0">
            <MessageSquareText />
          </div>
          <span className="text-[#A53C6F] font-medium">New chat</span>
        </button>

        {/* Search Results */}
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#A53C6F]"></div>
              <span className="ml-2 text-gray-600">Searching...</span>
            </div>
          ) : (
            <>
              {searchQuery.trim() ? (
                // Search Results
                searchResults.length > 0 ? (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-600 mb-2">
                      Search Results ({searchResults.length})
                    </h4>
                    <div className="space-y-1">
                      {searchResults.map((session, index) => (
                        <div
                          key={session.id}
                          onClick={() => handleSessionClick(session.id)}
                          className={`p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedIndex === index
                              ? "bg-[#A53C6F] text-white"
                              : "hover:bg-gray-100"
                          }`}
                        >
                          <div className="font-medium text-sm truncate">
                            {session.title || "Untitled"}
                          </div>
                          <div
                            className={`text-xs ${
                              selectedIndex === index
                                ? "text-white/70"
                                : "text-gray-500"
                            }`}
                          >
                            {getSessionGroupLabel(session.created_at)} •{" "}
                            {session.message_count} messages
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-lg mb-2">🔍</div>
                    <div>No chats found for "{searchQuery}"</div>
                    <div className="text-sm mt-1">Try different keywords</div>
                  </div>
                )
              ) : // Recent Sessions
              recentSessions.length > 0 ? (
                <div>
                  <h4 className="text-sm font-semibold text-gray-600 mb-2">
                    Recent Chats
                  </h4>
                  <div className="space-y-1">
                    {recentSessions.map((session, index) => (
                      <div
                        key={session.id}
                        onClick={() => handleSessionClick(session.id)}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedIndex === index
                            ? "bg-[#A53C6F] text-white"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        <div className="font-medium text-sm truncate">
                          {session.title || "Untitled"}
                        </div>
                        <div
                          className={`text-xs ${
                            selectedIndex === index
                              ? "text-white/70"
                              : "text-gray-500"
                          }`}
                        >
                          {getSessionGroupLabel(session.created_at)} •{" "}
                          {session.message_count} messages
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-lg mb-2">💬</div>
                  <div>No chat history yet</div>
                  <div className="text-sm mt-1">Start a new conversation</div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Backdrop closes modal */}
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
}
