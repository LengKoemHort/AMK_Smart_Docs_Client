import { ChatMessage } from "@/types/message-type";
import {
  Bot,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Share,
  Play,
  Pause,
} from "lucide-react";
import Image from "next/image";
import React, { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";

import PDFViewer from "@/components/PDFViewer/PDFViewer";
import PDFModal from "@/app/(main)/_document-management/(components)/pdf-modal";
import { viewDocumentDownloadPrivilege } from "@/services/documents/document.service";
import { useUser } from "@/context/UserContext";
import { UserRole } from "@/types/user-type";

interface MessageCardProps {
  message: ChatMessage;
  userRole?: UserRole;
  hasDownloadPrivilege: boolean;
}

export default function MessageCard({ message }: MessageCardProps) {
  const { user, hasDownloadPrivilege } = useUser();

  const [copiedMessage, setCopiedMessage] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [selectedPdf, setSelectedPdf] = useState<{
    url: string;
    name: string;
  } | null>(null);
  const [isPDFModalOpen, setIsPDFModalOpen] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState("");

  const handleCopyMessage = async (content: string, messageId: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(content);
        setCopiedMessage(messageId);
        setTimeout(() => setCopiedMessage(null), 2000);
      } catch (err) {
        console.error("Failed to copy message using Clipboard API:", err);
        alert("Failed to copy message. Please try again or copy manually.");
      }
    } else {
      // Fallback for browsers that do not support the Clipboard API
      // This method is deprecated but can be used as a last resort
      const textArea = document.createElement("textarea");
      textArea.value = content;
      textArea.style.position = "fixed"; // Avoid scrolling to bottom
      textArea.style.left = "-9999px"; // Move off-screen
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopiedMessage(messageId);
        setTimeout(() => setCopiedMessage(null), 2000);
      } catch (err) {
        console.error("Fallback: Failed to copy message using execCommand:", err);
        alert("Copy to clipboard is not supported in this browser. Please copy the text manually.");
      } finally {
        document.body.removeChild(textArea);
      }
    }
  };

  const handleViewPdf = async (
    fileUrl: string,
    fileName: string,
    documentId?: string
  ) => {
    if (hasDownloadPrivilege) {
      if (documentId) {
        try {
          await viewDocumentDownloadPrivilege(documentId);
        } catch (error) {
          console.error("Failed to access document:", error);
        }
      }
      setSelectedPdf({ url: fileUrl, name: fileName });
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

  const togglePlayback = () => {
    let audioSrc: string | null = null;
    let useBlob = false;

    if (message.voiceUrl) {
      audioSrc = message.voiceUrl;
    } else if (message.voiceBlob) {
      audioSrc = URL.createObjectURL(message.voiceBlob);
      useBlob = true;
    }

    if (!audioSrc) {
      console.error("No audio source available");
      return;
    }

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().catch((error) => {
          console.error("Failed to resume audio:", error);
          setIsPlaying(false);
        });
        setIsPlaying(true);
      }
    } else {
      const audio = new Audio(audioSrc);
      audioRef.current = audio;

      audio.onended = () => {
        setIsPlaying(false);
        setCurrentTime(0);
        if (useBlob && audioSrc) {
          URL.revokeObjectURL(audioSrc);
        }
      };

      audio.ontimeupdate = () => {
        setCurrentTime(audio.currentTime);
      };

      audio.onerror = (error) => {
        console.error("Error loading/playing audio:", error);

        if (!useBlob && message.voiceBlob) {
          console.log("Server audio failed, trying blob fallback");
          setIsPlaying(false);
          audioRef.current = null;

          setTimeout(() => {
            const blobUrl = URL.createObjectURL(message.voiceBlob!);
            const fallbackAudio = new Audio(blobUrl);
            audioRef.current = fallbackAudio;

            fallbackAudio.onended = () => {
              setIsPlaying(false);
              setCurrentTime(0);
              URL.revokeObjectURL(blobUrl);
            };

            fallbackAudio.ontimeupdate = () => {
              setCurrentTime(fallbackAudio.currentTime);
            };

            fallbackAudio
              .play()
              .then(() => {
                setIsPlaying(true);
              })
              .catch((err) => {
                console.error("Fallback blob audio also failed:", err);
                setIsPlaying(false);
                URL.revokeObjectURL(blobUrl);
              });
          }, 100);

          return;
        }

        setIsPlaying(false);
        if (useBlob && audioSrc) {
          URL.revokeObjectURL(audioSrc);
        }
      };

      audio
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((error) => {
          console.error("Failed to play audio:", error);
          setIsPlaying(false);
        });
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds) || !isFinite(seconds)) {
      return "0:00";
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getAudioDuration = () => {
    if (
      audioRef.current &&
      audioRef.current.duration &&
      !isNaN(audioRef.current.duration)
    ) {
      return audioRef.current.duration;
    }
    if (message.voiceDuration && message.voiceDuration > 0) {
      return message.voiceDuration;
    }
    return 0;
  };

  const progress = (() => {
    const duration = getAudioDuration();
    return duration > 0 ? (currentTime / duration) * 100 : 0;
  })();

  return (
    <>
      <div className="w-full mb-4">
        <div
          className={`max-w-[90%] md:max-w-[80%] flex items-end gap-2 sm:gap-3 py-1 sm:py-2
                ${
                  message.sender === "user"
                    ? "ml-auto flex-row-reverse"
                    : "mr-auto flex-row"
                }`}
        >
          {message.sender === "bot" && (
            <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-accent rounded-full flex items-center justify-center shadow-sm">
              <Bot className="text-primary w-5 h-5 sm:w-7 sm:h-7" />
            </div>
          )}

          <div className="flex flex-col max-w-full min-w-0">
            <div
              className={`flex flex-col px-3 py-2 sm:px-4 sm:py-3 shadow-xs
                        ${
                          message.sender === "user"
                            ? "bg-primary text-white rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-none"
                            : "font-normal border-gray-100 border-2 rounded-tl-2xl rounded-tr-2xl rounded-bl-none rounded-br-2xl"
                        }`}
            >
              {message.isVoice && (message.voiceBlob || message.voiceUrl) ? (
                <div className="flex flex-col gap-2 min-w-[200px] max-w-[240px] w-full">
                  <div className="flex items-center gap-2">
                    <button onClick={togglePlayback} className="flex-shrink-0">
                      {isPlaying ? (
                        <Pause
                          className={`w-5 h-5 ${
                            message.sender === "user"
                              ? "text-white"
                              : "text-gray-700"
                          }`}
                        />
                      ) : (
                        <Play
                          className={`w-5 h-5 ${
                            message.sender === "user"
                              ? "text-white"
                              : "text-gray-700"
                          }`}
                        />
                      )}
                    </button>

                    <div className="flex items-center gap-px flex-1">
                      {[...Array(45)].map((_, i) => {
                        const height = Math.random() * 0.6 + 0.4;
                        const isActive = progress > (i / 45) * 100;
                        return (
                          <div
                            key={i}
                            className={`w-px rounded-full transition-all duration-300 ${
                              message.sender === "user"
                                ? isActive
                                  ? "bg-white"
                                  : "bg-white bg-opacity-40"
                                : isActive
                                ? "bg-primary"
                                : "bg-gray-300"
                            }`}
                            style={{ height: `${height * 16}px` }}
                          />
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span
                      className={
                        message.sender === "user"
                          ? "text-white text-opacity-80"
                          : "text-gray-500"
                      }
                    >
                      {(() => {
                        const duration = getAudioDuration();
                        return isPlaying && duration > 0
                          ? formatTime(duration - currentTime)
                          : formatTime(duration);
                      })()}
                    </span>
                    {message.sender === "user" && (
                      <span className="text-white text-opacity-75">
                        {message.timestamp}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="break-words text-sm sm:text-base leading-relaxed">
                  {message.isTyping ? (
                    <span className="italic text-gray-500 animate-pulse">
                      Bot is typing...
                    </span>
                  ) : (
                    <div
                      className={`whitespace-pre-wrap font-sans ${
                        message.sender === "user" ? "text-white" : "text-black"
                      }`}
                    >
                      {message.content}
                    </div>
                  )}
                </div>

              )}

              {message.sender === "user" && !message.isVoice && (
                <span className="text-xs opacity-75 mt-1 text-right">
                  {message.timestamp}
                </span>
              )}
            </div>
          </div>
        </div>

        {message.sender === "bot" && message.fileUrl && message.hasReferences && (
          <div className="mr-auto flex">
            <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 mr-2 sm:mr-3"></div>
            <div className="space-y-2 max-w-sm sm:max-w-md">
              <div
                className="flex items-center gap-2 p-1 pr-3 rounded-2xl border border-gray-200 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 cursor-pointer"
                onClick={() =>
                  handleViewPdf(
                    message.fileUrl!,
                    message.fileName || "PDF Document",
                    message.docId
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
                  <p className="text-sm sm:text-base font-medium text-gray-900 truncate mb-1 hover:text-primary transition-colors">
                    {message.fileName || "PDF Document"}
                  </p>
                </div>
              </div>

              {message.published_date?.trim() && (
                <div className="text-primary">
                  <span className="text-primary text-sm m-1">
                    Published:{" "}
                    {message.published_date
                      ? new Date(message.published_date).toLocaleDateString(
                          "en-GB",
                          {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          }
                        )
                      : ""}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {message.sender === "bot" && (
          <div className="mr-auto flex mt-2">
            <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 mr-2 sm:mr-3"></div>
            <div className="flex flex-col">
              <div className="flex items-center gap-5">
                <button
                  onClick={() => handleCopyMessage(message.content, message.id)}
                  className="text-gray-600 hover:text-gray-800 transition-all duration-200 hover:scale-125"
                  title="Copy message"
                >
                  <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
                <button
                  className="text-gray-600 hover:text-green-600 transition-all duration-200 hover:scale-125"
                  title="Good response"
                >
                  <ThumbsUp className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
                <button
                  className="text-gray-600 hover:text-red-600 transition-all duration-200 hover:scale-125"
                  title="Poor response"
                >
                  <ThumbsDown className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
                <button
                  className="text-gray-600 hover:text-blue-600 transition-all duration-200 hover:scale-125"
                  title="Share message"
                >
                  <Share className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>

              {copiedMessage === message.id && (
                <div className="text-xs sm:text-sm text-green-600 mt-2 font-medium">
                  ✓ Copied to clipboard
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {selectedPdf && hasDownloadPrivilege && (
        <PDFViewer
          isOpen={!!selectedPdf}
          onClose={() => setSelectedPdf(null)}
          pdfUrl={selectedPdf.url}
          fileName={selectedPdf.name}
        />
      )}

      {!hasDownloadPrivilege && (
        <PDFModal
          isOpen={isPDFModalOpen}
          onClose={() => {
            setIsPDFModalOpen(false);
            setSelectedDocumentId("");
          }}
          documentId={selectedDocumentId}
        />
      )}
    </>
  );
}


