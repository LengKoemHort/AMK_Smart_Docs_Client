"use client";

import React, { useEffect, useState, useRef } from "react";
import { MessageSquareText, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  getChatSessions,
  searchChatSessionsWithContent,
} from "@/services/chats/chat.service";
import { ChatSession } from "@/types/chat-session-type";

export default function UploadModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
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
  }, [isOpen, selectedIndex, searchQuery, searchResults, recentSessions]);

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
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

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
        <h3 className="font-bold mb-4 text-base">Upload Document</h3>

        {/* Document Type */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="documentType">
            Document Type
          </label>
          <select
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="documentType"
          >
            <option>Memo</option>
            <option>Policy</option>
            <option>Guideline</option>
            <option>SOP</option>
            <option>Addendum</option>
            <option>Appendix</option>
            <option>Form</option>
          </select>
        </div>

        {/* Effective Date */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="effectiveDate">
            Effective Date
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="effectiveDate"
            type="date"
          />
        </div>

        {/* Expiry Date */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="expiryDate">
            Expiry Date
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="expiryDate"
            type="date"
          />
        </div>

        {/* Status */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="status">
            Status
          </label>
          <select
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="status"
          >
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>

        {/* File Upload */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="file">
            Choose File
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="file"
            type="file"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-between">
        <button
          className="bg-[#A53C6F] hover:bg-[#792a52] text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          type="button"
          onClick={async () => {
            const fileInput = document.getElementById("file") as HTMLInputElement;
            const file = fileInput.files?.[0];
            const documentType = (document.getElementById("documentType") as HTMLSelectElement).value;
            const effectiveDate = (document.getElementById("effectiveDate") as HTMLInputElement).value;
            const expiryDate = (document.getElementById("expiryDate") as HTMLInputElement).value;
            const status = (document.getElementById("status") as HTMLSelectElement).value;

            if (file) {
              const formData = new FormData();
              formData.append("file", file);
              formData.append("document_type_id", documentType);
              formData.append("department_id", "your_department_id"); // Replace with actual department ID
              formData.append("effective_date", effectiveDate);
              formData.append("expiry_date", expiryDate);
              formData.append("status", status);

              try {
                const response = await fetch("/api/documents/upload/", {
                  method: "POST",
                  body: formData,
                });

                if (response.ok) {
                  console.log("Document uploaded successfully!");
                  onClose();
                } else {
                  console.error("Document upload failed:", response);
                }
              } catch (error) {
                console.error("Error uploading document:", error);
              }
            }
          }}
        >
          Upload
        </button>
        <button
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          type="button"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </dialog>
  );
}