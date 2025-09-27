"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import SearchModal from "@/components/SearchModal";

interface SearchModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModalWrapper({
  isOpen,
  onClose,
}: SearchModalWrapperProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  const modalContent = (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />
      )}

      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <SearchModal isOpen={isOpen} onClose={onClose} />
        </div>
      )}
    </>
  );

  return createPortal(modalContent, document.getElementById("popup-root")!);
}
