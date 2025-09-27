"use client";

import SidebarNewChatButton from "@/app/(main)/_chatbot/(components)/NewChatButton";
import { Archive, Bot, Folder, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import SearchModalWrapper from "@/app/(main)/_document-management/(components)/search-modal-wrapper.tsx";

export default function SidebarTool({
  minimized = false,
}: {
  minimized?: boolean;
}) {
  const pathname = usePathname();
  const [showSearchModal, setShowSearchModal] = useState(false);

  const isChatbotActive = pathname === "/c" || pathname.startsWith("/c/");
  const isDocumentActive = pathname === "/d" || pathname === "/d/upload";
  const isArchiveActive = pathname === "/d/archive";

  return (
    <>
      <div className="flex flex-col gap-3">
        <SidebarNewChatButton minimized={minimized} />

        <div
          onClick={() => setShowSearchModal(true)}
          className={`flex flex-row gap-2 rounded-lg transition-all duration-200 ease-in-out cursor-pointer hover:bg-primary hover:text-white text-base-content transform items-center ${
            minimized
              ? "py-2 justify-center tooltip tooltip-right z-100"
              : "p-2 justify-start"
          }`}
        >
          <Search />
          {!minimized && "Search"}
        </div>

        <Link href="/c">
          <div
            className={`flex flex-row gap-2 rounded-lg transition-all duration-200 ease-in-out cursor-pointer hover:bg-primary hover:text-white transform items-center ${
              isChatbotActive
                ? "bg-primary text-accent"
                : "bg-base-content/5 text-base-content"
            } ${
              minimized
                ? "py-2 justify-center tooltip tooltip-right z-100"
                : "p-2 justify-start"
            }`}
          >
            <Bot />
            {!minimized && "Chatbot"}
          </div>
        </Link>

        <Link href="/d">
          <div
            className={`flex flex-row gap-2 rounded-lg transition-all duration-200 ease-in-out cursor-pointer hover:bg-primary hover:text-white transform items-center ${
              isDocumentActive
                ? "bg-primary text-accent"
                : "bg-base-content/5 text-base-content"
            } ${
              minimized
                ? "py-2 justify-center tooltip tooltip-right z-100"
                : "p-2 justify-start"
            }`}
          >
            <Folder />
            {!minimized && "Document"}
          </div>
        </Link>

        <Link href="/d/archive">
          <div
            className={`flex flex-row gap-2 rounded-lg transition-all duration-200 ease-in-out cursor-pointer hover:bg-primary hover:text-white transform items-center ${
              isArchiveActive
                ? "bg-primary text-accent"
                : "bg-base-content/5 text-base-content"
            } ${
              minimized
                ? "py-2 justify-center tooltip tooltip-right"
                : "p-2 justify-start"
            }`}
          >
            <Archive />
            {!minimized && "Archive"}
          </div>
        </Link>
      </div>
      <SearchModalWrapper
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
      />
    </>
  );
}
