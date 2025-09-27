"use client";

import { Bot, Folder } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export default function SidebarNavigation({
  minimized = false,
}: {
  minimized?: boolean;
}) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-3">
      <Link
        href="/c"
        className={`flex items-center gap-2 rounded-lg font-bold transition-all duration-200 transform hover:bg-[#A53C6F] hover:text-white 
          ${
            pathname === "/c"
              ? "bg-[#EDD8E2] text-[#A53C6F]"
              : "bg-[#D9D9D9] text-black"
          }
          ${minimized ? "p-2 justify-center" : "p-3 pl-5 justify-start"}
        `}
      >
        {minimized ? (
          <Bot />
        ) : (
          <>
            <Bot />
            Chatbot
          </>
        )}
      </Link>
      <Link
        href="/d"
        className={`flex items-center gap-2 rounded-lg font-bold transition-all duration-200 transform hover:bg-[#A53C6F] hover:text-white 
          ${
            pathname === "/d"
              ? "bg-[#EDD8E2] text-[#A53C6F]"
              : "bg-[#D9D9D9] text-black"
          }
          ${minimized ? "p-2 justify-center" : "p-3 pl-5 justify-start"}
        `}
      >
        {minimized ? (
          <Folder />
        ) : (
          <>
            <Folder />
            Document
          </>
        )}
      </Link>
    </div>
  );
}
