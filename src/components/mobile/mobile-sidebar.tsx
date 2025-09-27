"use client";
import React from "react";
import Sidebar from "@/components/Sidebar/Sidebar";

interface MobileSidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  isMobile: boolean;
}

export default function MobileSidebar({
  open,
  setOpen,
  isMobile,
}: MobileSidebarProps) {
  if (!isMobile || !open) return null;

  return (
    <>
      <div className="fixed top-0 left-0 h-full w-64 bg-sidebar z-50 transform transition-transform duration-300 translate-x-0">
        <Sidebar open={open} setOpen={setOpen} isMobile />
      </div>

      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gray-500/40 z-40"
        onClick={() => setOpen(false)}
      />
    </>
  );
}
