"use client";
import React, { useState } from "react";
import { ChatMessage } from "@/types/message-type";
import { X } from "lucide-react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import MessageActions from "./message-actions";
import PDFViewer from "@/components/PDFViewer/PDFViewer";
import PDFModal from "@/app/(main)/_document-management/(components)/pdf-modal";
import { viewDocumentDownloadPrivilege } from "@/services/documents/document.service";
import { useUser } from "@/context/UserContext";
import { UserRole } from "@/types/user-type";

interface FullResponseModalProps {
  msg: ChatMessage;
  copiedMessage: string | null;
  onCopy: (content: string, messageId: string) => void;
  onClose: () => void;
  userRole?: UserRole;
}

export default function FullResponseBox({
  msg,
  copiedMessage,
  onCopy,
  onClose,
}: FullResponseModalProps) {
  const { user, hasDownloadPrivilege } = useUser();

  // PDF Modal states
  const [selectedPdf, setSelectedPdf] = useState<{
    url: string;
    name: string;
  } | null>(null);
  const [isPDFModalOpen, setIsPDFModalOpen] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState("");

  const handleViewPdf = async (
    url: string,
    name: string,
    documentId?: string
  ) => {
    if (hasDownloadPrivilege) {
      setSelectedPdf({ url, name });
    } else {
      if (documentId) {
        try {
          await viewDocumentDownloadPrivilege(documentId);
          setSelectedDocumentId(documentId);
          setIsPDFModalOpen(true);
        } catch (error) {
          console.error("Error accessing document:", error);
        }
      }
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="bg-base-100 rounded-xl shadow-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center border-b border-base-content/30 px-4 py-2">
            <h2 className="text-lg md:text-xl font-semibold text-primary">
              Full Response
            </h2>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-900"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {/* Content */}
          <div className="p-4 text-sm md:text-lg overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <ReactMarkdown>{msg.content}</ReactMarkdown>
            {msg.published_date?.trim() && (
              <div className="text-primary">
                <span className="text-primary text-sm m-1">
                  Published:{" "}
                  {msg.published_date
                    ? new Date(msg.published_date).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })
                    : ""}
                </span>
              </div>
            )}

            {msg.fileUrl && (
              <div
                className="mt-3 flex items-center gap-2 p-2 pr-3 rounded-2xl border border-base-content/10 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 cursor-pointer"
                onClick={() =>
                  handleViewPdf(
                    msg.fileUrl!,
                    msg.fileName || "PDF Document",
                    msg.docId
                  )
                }
              >
                <div className="flex-shrink-0">
                  <Image
                    src="/PDFicon.svg"
                    alt="PDF"
                    width={40}
                    height={40}
                    className="w-10 h-10 sm:w-12 sm:h-12"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-base font-medium truncate mb-1 hover:text-primary transition-colors">
                    {msg.fileName || "PDF Document"}
                  </p>
                  {/* Role-based indicator badge */}
                  <p className="text-xs text-base-content/60">
                    {hasDownloadPrivilege ? "Download Available" : "View Only"}
                  </p>
                </div>
              </div>
            )}

            <MessageActions
              msgId={msg.id}
              content={msg.content}
              copiedMessage={copiedMessage}
              onCopy={onCopy}
            />
          </div>
        </div>
      </div>

      {/* PDF Viewer Modal for Admin/Downloader */}
      {selectedPdf && hasDownloadPrivilege && (
        <PDFViewer
          pdfUrl={selectedPdf.url}
          fileName={selectedPdf.name}
          isOpen={true}
          onClose={() => setSelectedPdf(null)}
        />
      )}

      {/* PDF Modal for Regular Users */}
      {isPDFModalOpen && selectedDocumentId && !hasDownloadPrivilege && (
        <PDFModal
          documentId={selectedDocumentId}
          isOpen={isPDFModalOpen}
          onClose={() => {
            setIsPDFModalOpen(false);
            setSelectedDocumentId("");
          }}
        />
      )}
    </>
  );
}
