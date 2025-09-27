"use client";

import { softDeleteDocument } from "@/services/documents/document.service";
import Link from "next/link";
import { useEffect, useRef } from "react";

interface MobileDocumentOptionsProps {
  isOpen: boolean;
  selectedDocId: string | null;
  onClose: () => void;
  onView: (id: string) => void;
  showDeleteButton?: boolean;
  showRestoreButton?: boolean;
  onRestore?: () => void;
}

export default function MobileDocumentOptions({
  isOpen,
  selectedDocId,
  onClose,
  onView,
  showDeleteButton = true,
  showRestoreButton = false,
}: MobileDocumentOptionsProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !selectedDocId) return null;

  const deleteDocument = async () => {
    await softDeleteDocument(selectedDocId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-gray-500/30">
      <div
        ref={panelRef}
        className="bg-base-100 w-full max-w-md p-4 rounded-t-2xl shadow-xl animate-slide-up"
      >
        <p className="text-lg font-bold mb-2 ml-2">Options</p>
        <ul className="space-y-2">
          <li className="w-fit">
            <button
              className="w-full text-left"
              onClick={() => {
                onView(selectedDocId);
                onClose();
              }}
            >
              View Details
            </button>
          </li>
          <li className="w-fit">
            <Link href={`/d/update/${selectedDocId}`}>
              <button
                className="w-full text-left"
                onClick={() => {
                  onClose();
                }}
              >
                Update
              </button>
            </Link>
          </li>

          <li className="w-fit">
            {showDeleteButton && (
              <button
                className="w-full text-left text-red-600"
                onClick={() => {
                  deleteDocument();
                  onClose();
                }}
              >
                Delete
              </button>
            )}

            {showRestoreButton && (
              <button
                className="w-full text-left text-green-600"
                onClick={() => {
                  // deleteDocument();
                  onClose();
                }}
              >
                Restore
              </button>
            )}
          </li>
        </ul>
        <button onClick={onClose} className="w-full text-base-content/50 mt-4">
          Cancel
        </button>
      </div>
    </div>
  );
}
