import SidebarHeader from "./SidebarHeader";
import SidebarHistory from "./SidebarHistory";
import SidebarTool from "./SidebarTool";
import React from "react";

export default function Sidebar({
  open,
  setOpen,
  isMobile = false,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  isMobile?: boolean;
}) {
  // on mobile & close, hide sidebar
  if (isMobile && !open) {
    return null;
  }

  return (
    <div
      className={`
        h-full flex flex-col sticky top-0 self-start bg-base-100 z-10 ${
          open ? "px-2 py-3 w-[240px]" : "items-center p-2 gap-2 w-[64px]"
        }
      `}
    >
      <div className="flex flex-col gap-3 flex-shrink-0 px-1">
        <SidebarHeader open={open} setOpen={setOpen} />
        <SidebarTool minimized={!open} />
      </div>

      {/* History scroll area only */}
      <div className="flex-1 min-h-0 flex flex-col overflow-y-auto gap-3 mt-6 mb-4">
        {open && <SidebarHistory />}
      </div>
    </div>
  );
}
