import { UserPen, Settings, LogOut } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { clearTokens } from "@/lib/token-store";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";

export default function UserProfile() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user } = useUser();

  const userNameInitials =
    (user?.first_name?.[0] || "") + (user?.last_name?.[0] || "");

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const Logout = () => {
    clearTokens();
    router.push("/login");
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        aria-label="Toggle user profile menu"
      >
        <div className="avatar avatar-online avatar-placeholder border border-pink-300 rounded-full">
          <div className="bg-primary text-neutral-content w-10 rounded-full hover:cursor-pointer">
            <span className="text-md">{userNameInitials}</span>
          </div>
        </div>
      </button>

      {open && (
        <ul className="absolute right-0 mt-3 w-44 rounded-md bg-base-100 p-2 shadow text-sm">
          <li>
            <a className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-900">
              <UserPen size={16} /> Profile
            </a>
          </li>
          <li>
            <a className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-900">
              <Settings size={16} /> Settings
            </a>
          </li>
          <li>
            <a
              onClick={Logout}
              className="flex items-center gap-2 px-2 py-1 rounded text-red-600 hover:bg-gray-100 dark:hover:bg-gray-900"
            >
              <LogOut size={16} /> Logout
            </a>
          </li>
        </ul>
      )}
    </div>
  );
}
