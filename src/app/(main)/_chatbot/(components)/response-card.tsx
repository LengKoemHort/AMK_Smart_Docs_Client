"use client";
import { ChatMessage } from "@/types/message-type";
import Image from "next/image";
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import MessageActions from "./message-actions";
import FullResponseBox from "./full-response-box";
import PDFModal from "@/app/(main)/_document-management/(components)/pdf-modal";
import { viewDocumentDownloadPrivilege } from "@/services/documents/document.service";
import { UserRole } from "@/types/user-type";
import { useUser } from "@/context/UserContext";

interface ResponseCardProps {
  msg: ChatMessage;
  idx: number;
  isInGrid?: boolean;
  userRole?: UserRole;
}

function ResponseCard({
  msg,
  idx,
  isInGrid = true,
  userRole,
}: ResponseCardProps) {
  const { user, hasDownloadPrivilege } = useUser();

  const [copiedMessage, setCopiedMessage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Removed unused 'selectedPdf' variable
  const [isPDFModalOpen, setIsPDFModalOpen] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState("");

  const handleCopyMessage = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessage(messageId);
      setTimeout(() => setCopiedMessage(null), 2000);
    } catch (err) {
      console.error("Failed to copy message:", err);
    }
  };

  const handleViewPdf = async (
    fileUrl: string,
    fileName: string,
    documentId?: string
  ) => {
    console.log("res-card: " + JSON.stringify(user));
    if (user && hasDownloadPrivilege) {
      if (documentId) {
        try {
          await viewDocumentDownloadPrivilege(documentId);
        } catch (error) {
          console.error("Failed to access document:", error);
        }
      }
      // Removed unused 'selectedPdf' variable assignment
    } else {
      if (documentId) {
        setSelectedDocumentId(documentId);
        setIsPDFModalOpen(true);
      } else {
        console.warn("Document ID required for view-only access");
        alert(
          "Document viewing requires proper authentication. Please contact your administrator."
        );
      }
    }
  };

  const needsTruncation =
    isInGrid &&
    (msg.content.split("\n").length > 10 || msg.content.length > 600);

  const showReferences =
    msg.fileUrl &&
    msg.hasReferences &&
    !msg.content.includes("No relevant information found") &&
    !msg.content.includes("ឯកសារមិនមានព័ត៌មានពាក់ព័ន្ធនឹងចម្លើយសំណួររបស់អ្នក");

  return (
    <>
      <div className="bg-base-100 flex flex-col h-fit text-base-content rounded-2xl px-4 py-3 shadow-sm hover:shadow-md transition-all duration-200">
        <div className="text-primary font-semibold mb-2 flex-shrink-0">
          Response #{idx + 1}
        </div>

        <div className="text-sm sm:text-base leading-relaxed">
          {needsTruncation ? (
            <div className="relative flex flex-col">
              <div className="break-words transition-all duration-300 max-h-[240px] overflow-y-auto pr-2">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="hover:cursor-pointer text-primary hover:text-primary/80 text-right text-sm font-medium mt-2 transition-colors duration-200 self-start flex-shrink-0"
              >
                See more
              </button>
            </div>
          ) : (
            <div className="break-words">
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          )}
        </div>

        {showReferences && (
          <div
            className="mt-3 flex items-center gap-2 p-2 pr-3 rounded-2xl border border-base-content/10 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 cursor-pointer flex-shrink-0"
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
                className="w-8 h-8 sm:w-10 sm:h-10 md:w-8 md:h-8 lg:w-10 lg:h-10"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm md:text-xs lg:text-sm font-medium truncate hover:text-primary transition-colors">
                {(() => {
                  try {
                    if (!msg.fileName) return "PDF Document";
                    const newFileName = msg.fileName.replace(
                      /_\d+(?=\.pdf$)/,
                      ""
                    );
                    return newFileName || msg.fileName;
                  } catch {
                    return msg.fileName || "PDF Document";
                  }
                })()}
              </p>
            </div>
          </div>
        )}

        {msg.published_date?.trim() && (
          <div className="text-primary">
            <span className="text-primary text-sm m-1">
              Published: "
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

        <div className="flex-shrink-0 mt-3">
          <MessageActions
            msgId={msg.id}
            content={msg.content}
            copiedMessage={copiedMessage}
            onCopy={handleCopyMessage}
          />
        </div>
      </div>

      {isModalOpen && (
        <FullResponseBox
          msg={msg}
          copiedMessage={copiedMessage}
          onCopy={handleCopyMessage}
          onClose={() => setIsModalOpen(false)}
          userRole={userRole}
        />
      )}

      <PDFModal
        isOpen={isPDFModalOpen}
        onClose={() => {
          setIsPDFModalOpen(false);
          setSelectedDocumentId("");
        }}
        documentId={selectedDocumentId}
      />
    </>
  );
}

export default ResponseCard;
