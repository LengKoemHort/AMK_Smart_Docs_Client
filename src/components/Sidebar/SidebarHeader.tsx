import { PanelRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function SidebarHeader({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
}) {
  return (
    <div className="flex flex-row justify-between items-center w-full">
      <div></div>
      {open ? (
        <Link
          href="https://www.amkcambodia.com/en/"
          className="tooltip tooltip-bottom"
          target="_blank"
          data-tip="To AMK Website"
        >
          <img src="/amk_logo.svg" alt="logo.svg" />
        </Link>
      ) : (
        <Link
          href="https://www.amkcambodia.com/en/"
          className="p-1 my-4"
          target="_blank"
        >
          <img src="/amk_logo.svg" alt="logo.svg" />
        </Link>
      )}
      {open && (
        <div className="cursor-pointer" onClick={() => setOpen(false)}>
          <PanelRight />
        </div>
      )}
    </div>
  );
}
