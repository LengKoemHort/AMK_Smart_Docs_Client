"use client";

import { DocumentProps } from "@/types/document-type";
import Image from "next/image";

interface MobileDocumentDetailProps {
  isOpen: boolean;
  document: DocumentProps | null;
  onClose: () => void;
}

export default function MobileDocumentDetail({
  isOpen,
  document,
  onClose,
}: MobileDocumentDetailProps) {
  if (!isOpen || !document) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-base-100 rounded-xl max-w-sm w-full shadow-lg animate-fade-in">
        <div className="flex justify-between items-center bg-primary py-2 px-4 rounded-t-xl">
          <div></div>
          <div className="text-lg font-semibold text-base-content">
            Document Detail
          </div>
          <button onClick={onClose} className="text-base-content font-bold">
            X
          </button>
        </div>

        <div className="p-6 space-y-2">
          {/* Title and Version */}
          <div className="grid grid-cols-[1fr_2fr_4fr] space-y-2">
            <Image
              className="rounded-sm"
              src="/pdf-logo.png"
              alt="PDF"
              sizes="auto"
              height={42}
              width={28}
            />

            <div className="grid grid-rows-2">
              <span className="text-primary">Title:</span>
              <span className="text-primary mt-0.5">Version:</span>
            </div>

            <div className="grid grid-rows-2">
              <span>{document.title}</span>
              <span className="w-fit text-center self-center text-xs text-base-content bg-red-600 px-2 rounded-xl mb-1">
                v{document.version}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-[3fr_4fr]">
            <div className="grid grid-rows-3 space-y-1">
              <span className="font-semibold text-primary">DocType:</span>
              <span className="font-semibold text-primary">Department:</span>
              <span className="font-semibold text-primary">Issued Date:</span>
            </div>

            <div className="grid grid-rows-3 space-y-1">
              <span>{document.document_type}</span>
              <span>{document.department}</span>
              <span>
                {new Date(document.published_date).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
