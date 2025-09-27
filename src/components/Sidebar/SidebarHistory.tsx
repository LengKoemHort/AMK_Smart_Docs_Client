"use client";

import { Ellipsis, LucidePencil, Trash2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";
import Portal from "../Portal";
import {
  deleteChatHistory,
  getChatHistory,
  updateChatHistory,
} from "@/services/chats/chat-history.service";
import { ChatSession } from "@/types/chat-session-type";

function getSessionGroupLabel(dateStr: string): string {
  const createdDate = new Date(dateStr);
  const now = new Date();

  if (isNaN(createdDate.getTime())) return "Unknown";

  const isSameDay =
    createdDate.getFullYear() === now.getFullYear() &&
    createdDate.getMonth() === now.getMonth() &&
    createdDate.getDate() === now.getDate();

  if (isSameDay) return "Today";

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  const isYesterday =
    createdDate.getFullYear() === yesterday.getFullYear() &&
    createdDate.getMonth() === yesterday.getMonth() &&
    createdDate.getDate() === yesterday.getDate();

  if (isYesterday) return "Yesterday";

  const diffTime = now.getTime() - createdDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 7) return "Last 7 Days";
  if (diffDays <= 30) return "Last 30 Days";
  return "Older";
}

interface SidebarHistoryProps {
  page?: number;
  per_page?: number;
}

export default function SidebarHistory({
  page = 1,
  per_page = 20,
}: SidebarHistoryProps) {
  const popupRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sessionsByGroup, setSessionsByGroup] = useState<
    Record<string, ChatSession[]>
  >({});
  const [activePopupSession, setActivePopupSession] = useState<string | null>(
    null
  );

  const currentSessionId = pathname?.startsWith("/c/")
    ? pathname.split("/c/")[1]
    : null;

  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState<string>("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        setActivePopupSession(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSessions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getChatHistory(page, per_page);

      const grouped: Record<string, ChatSession[]> = {};
      res.forEach((session: ChatSession) => {
        const group = getSessionGroupLabel(session.created_at);
        if (!grouped[group]) grouped[group] = [];
        grouped[group].push(session);
      });

      setSessionsByGroup(grouped);
    } catch (err: any) {
      console.error("Failed to fetch sessions:", err);
      setError("Unable to load chat history. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const saveTitle = async (sessionId: string) => {
    if (editedTitle.trim() === "") return;

    try {
      await updateChatHistory(sessionId, editedTitle.trim());
      setEditingSessionId(null);
      fetchSessions();
    } catch (err) {
      console.error("Rename failed", err);
    }
  };

  const handleRename = (sessionId: string, currentTitle: string) => {
    setEditingSessionId(sessionId);
    setEditedTitle(currentTitle);
    setActivePopupSession(null);
  };

  return (
    <div>
      <h2 className="pb-2 font-semibold text-sm text-base-content/70 uppercase px-2 sticky top-0 z-20 bg-base-100">
        History
      </h2>

      {loading && (
        <div className="flex items-center gap-2 text-xs text-gray-500 px-2 py-2">
          <span className="loading loading-spinner loading-xs"></span>
          Loading sessions...
        </div>
      )}

      {!loading && error && (
        <div className="text-xs text-red-500 px-2 py-2">{error}</div>
      )}

      {!loading && !error && Object.keys(sessionsByGroup).length === 0 && (
        <p className="text-xs text-gray-500 px-2 py-2">No sessions yet</p>
      )}

      {!loading &&
        Object.entries(sessionsByGroup).map(([group, sessions]) => (
          <div key={group} className="mb-4">
            <h3 className="text-xs font-semibold text-base-content/35 mb-1 px-2 sticky top-6 z-10 bg-base-100">
              {group}
            </h3>
            <ul className="space-y-0.5">
              {sessions.map((session) => {
                const isActive = session.id === currentSessionId;

                return (
                  <li
                    key={session.id}
                    className={`group relative cursor-pointer px-2 py-1 rounded-sm flex items-center justify-between ${
                      isActive ? "bg-gray-300" : "hover:bg-base-200"
                    }`}
                    title={session.title}
                  >
                    {editingSessionId === session.id ? (
                      <input
                        className="flex-grow text-sm px-1 py-0.5 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-400"
                        value={editedTitle}
                        autoFocus
                        onChange={(e) => setEditedTitle(e.target.value)}
                        onBlur={() => saveTitle(session.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            saveTitle(session.id);
                          } else if (e.key === "Escape") {
                            setEditingSessionId(null);
                          }
                        }}
                      />
                    ) : (
                      <div
                        onClick={() => router.push(`/c/${session.id}`)}
                        className="flex-grow text-sm text-base-content truncate"
                      >
                        {session.title}
                      </div>
                    )}

                    <div
                      className="relative ml-2"
                      ref={activePopupSession === session.id ? popupRef : null}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActivePopupSession((prev) =>
                            prev === session.id ? null : session.id
                          );
                        }}
                        className="text-gray-500 hover:text-black opacity-100 sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer"
                        aria-label="Session actions"
                      >
                        <Ellipsis size={16} />
                      </button>

                      {activePopupSession === session.id && (
                        <Portal>
                          <HistoryPopUpBox
                            onRename={() =>
                              handleRename(session.id, session.title)
                            }
                            onDelete={() => {
                              setSessionToDelete(session.id);
                              setShowDeleteModal(true);
                              setActivePopupSession(null);
                            }}
                            anchorRef={popupRef}
                          />
                        </Portal>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

      {/* confirm delete box */}
      <ConfirmDeleteDialog
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSessionToDelete(null);
        }}
        sessionId={sessionToDelete}
        currentSessionId={currentSessionId}
        onDeleteSuccess={fetchSessions}
      />
    </div>
  );
}

interface ConfirmDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string | null;
  currentSessionId: string | null;
  onDeleteSuccess: () => void;
}

function ConfirmDeleteDialog({
  isOpen,
  onClose,
  sessionId,
  currentSessionId,
  onDeleteSuccess,
}: ConfirmDeleteDialogProps) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!sessionId) return;

    try {
      await deleteChatHistory(sessionId);
      if (currentSessionId === sessionId) {
        router.push("/c");
      }
      onDeleteSuccess();
    } catch (err) {
      console.error("Delete failed", err);
    } finally {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <dialog className="modal z-[60]" open>
      <div className="modal-box">
        <h3 className="font-bold text-lg">Delete Session?</h3>
        <p className="py-2 text-sm">
          Are you sure you want to delete this session? This action cannot be
          undone!
        </p>
        <div className="modal-action">
          <form method="dialog" className="flex gap-2">
            <button
              className="btn bg-gray-200 hover:bg-gray-300 text-gray-800 border-gray-300 hover:cursor-pointer"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="btn btn-error text-white bg-red-500 hover:bg-red-600 hover:cursor-pointer"
              onClick={handleDelete}
            >
              Delete
            </button>
          </form>
        </div>
      </div>
    </dialog>
  );
}

interface PopupProps {
  onRename: () => void;
  onDelete: () => void;
  anchorRef: React.RefObject<HTMLDivElement | null>;
}

function HistoryPopUpBox({ onRename, onDelete, anchorRef }: PopupProps) {
  const [style, setStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setStyle({
        position: "absolute",
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        zIndex: 1000,
      });
    }
  }, [anchorRef]);

  return (
    <div
      style={style}
      className="w-28 bg-base-200 border-base-100 rounded-lg shadow-lg text-sm p-1"
      onMouseDown={(e) => e.stopPropagation()} //preventer outside click from triggering
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
          onRename();
        }}
        className="px-3 py-2 flex space-x-2 text-center rounded-lg hover:bg-base-100 cursor-pointer"
      >
        <LucidePencil size={14} className="self-center" />
        <div>Rename</div>
      </div>
      <div
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="px-3 py-2 flex space-x-2 text-center rounded-lg hover:bg-base-100 cursor-pointer text-red-600"
      >
        <Trash2 size={14} className="self-center" />
        <div>Delete</div>
      </div>
    </div>
  );
}
