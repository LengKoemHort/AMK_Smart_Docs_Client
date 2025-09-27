"use client";

import UserProfile from "./UserProfile";
import { PanelRight } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Header({
  sidebarOpen,
  setSidebarOpen,
}: {
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
}) {
  const pathname = usePathname();

  const getTitle = (pathname: string): string => {
    if (pathname === "/c" || pathname.startsWith("/c/")) {
      return "Chatbot";
    }

    if (pathname === "/d/upload") {
      return "Upload Document";
    }

    const titles: Record<string, string> = {
      "/d": "Document Management",
      "/d/archive": "Document Archive",
    };

    return titles[pathname] || "Upload Document";
  };

  const title = getTitle(pathname);

  return (
    <nav
      className={`fixed z-50 top-0 bg-base-100 shadow px-5 h-16 flex items-center transition-all duration-300
            ${
              sidebarOpen
                ? "w-[calc(100%-240px)] left-[240px]"
                : "w-[calc(100%-64px)] left-[64px]"
            }`}
    >
      <div className="flex items-center gap-3">
        {!sidebarOpen && (
          <div
            className="tooltip tooltip-bottom flex items-center cursor-pointer"
            data-tip="Open sidebar"
            onClick={() => setSidebarOpen(true)}
            role="button"
            aria-label="Open sidebar"
          >
            <PanelRight />
          </div>
        )}
        <h1 className="font-bold text-base-content text-2xl flex items-center">
          {title}
        </h1>
      </div>
      <div className="ml-auto flex items-center min-w-[40px] h-10">
        <UserProfile />
      </div>
    </nav>
  );
}
