"use client";

import { Copy, ThumbsUp, ThumbsDown } from "lucide-react";
import React from "react";

interface MessageActionsProps {
  msgId: string;
  content: string;
  copiedMessage: string | null;
  onCopy: (content: string, messageId: string) => void;
}

export default function MessageActions({
  msgId,
  content,
  copiedMessage,
  onCopy,
}: MessageActionsProps) {
  return (
    <div className="flex items-center gap-5 mt-3 pt-2 px-2 border-t border-base-content/10">
      <button
        onClick={() => onCopy(content, msgId)}
        className="text-gray-600 hover:text-gray-800 transition-all duration-200 hover:scale-110"
        title="Copy message"
      >
        <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
      </button>
      <button
        className="text-gray-600 hover:text-green-600 transition-all duration-200 hover:scale-110"
        title="Good response"
      >
        <ThumbsUp className="w-3 h-3 sm:w-4 sm:h-4" />
      </button>
      <button
        className="text-gray-600 hover:text-red-600 transition-all duration-200 hover:scale-110"
        title="Poor response"
      >
        <ThumbsDown className="w-3 h-3 sm:w-4 sm:h-4" />
      </button>
      {/* <button
        className="text-gray-600 hover:text-blue-600 transition-all duration-200 hover:scale-110"
        title="Share message"
      >
      </button> */}
      {copiedMessage === msgId && (
        <div className="text-xs sm:text-sm text-green-600 animate-fade-in">
          ✓ Copied to clipboard
        </div>
      )}
    </div>
  );
}
