"use client";

import UserProfile from "../Header/UserProfile";
import { PanelRight } from "lucide-react";
import Image from "next/image";

export default function MobileHeader({
  sidebarOpen,
  setSidebarOpen,
}: {
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between px-6 py-3 bg-primary text-base-content fixed w-full z-10 top-0 md:hidden">
      {!sidebarOpen && (
        <button
          className="tooltip tooltip-bottom z-20 flex items-center cursor-pointer text-white"
          onClick={() => setSidebarOpen(true)}
          role="button"
          aria-label="Open sidebar"
        >
          <PanelRight />
        </button>
      )}

      <Image
        height={34}
        width={48}
        sizes="auto"
        src="/amk-logo-white.png"
        alt="amk-logo-white"
      />

      <div className="min-w-[40px] flex justify-end">
        <UserProfile />
      </div>
    </div>
  );
}
