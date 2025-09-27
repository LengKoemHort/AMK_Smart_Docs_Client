"use client";

import { Mic, Upload, X, Check, Loader2 } from "lucide-react";
import React, { useRef, useEffect, useState } from "react";
import getDocumentTypes from "@/services/documents/document-type.service";

interface ChatInputProps {
  onSendMessage: (
    text: string,
    voiceBlob?: Blob,
    voiceDuration?: number,
    documentType?: string
  ) => void;
}

interface DocumentType {
  key: string;
  label: string;
}

export default function ChatInput({ onSendMessage }: ChatInputProps) {
  const [value, setValue] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showDocTypes, setShowDocTypes] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<string>("");
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [filteredDocTypes, setFilteredDocTypes] = useState<DocumentType[]>([]);
  const [atPosition, setAtPosition] = useState(-1);
  const [isLoadingDocTypes, setIsLoadingDocTypes] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const docTypesRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const recordStartTimeRef = useRef<number>(0);
  const audioChunksRef = useRef<Blob[]>([]);

  // Fetch document types from backend using your service
  const fetchDocumentTypes = async () => {
    setIsLoadingDocTypes(true);
    try {
      const data = await getDocumentTypes();

      // Format the data from your Django API
      const formattedTypes = data.map((item: unknown) => {
        const typedItem = item as {
          key?: string;
          name?: string;
          label?: string;
        };
        return {
          key:
            typedItem.key || typedItem.name?.toLowerCase().replace(/\s+/g, "_"),
          label: `@${typedItem.name || typedItem.label}`,
        };
      });

      setDocumentTypes(formattedTypes);
      setFilteredDocTypes(formattedTypes);
    } catch (error) {
      console.error("Error fetching document types:", error);
      // Fallback to default types if API fails
      const defaultTypes = [
        { key: "contract", label: "@Contract" },
        { key: "guideline", label: "@Guideline" },
        { key: "report", label: "@Report" },
        { key: "policy_document", label: "@Policy Document" },
        { key: "procedure_manual", label: "@Procedure Manual" },
        { key: "training_material", label: "@Training Material" },
        { key: "invoice", label: "@Invoice" },
        { key: "certificate", label: "@Certificate" },
      ];
      setDocumentTypes(defaultTypes);
      setFilteredDocTypes(defaultTypes);
    } finally {
      setIsLoadingDocTypes(false);
    }
  };

  // Fetch document types on component mount
  useEffect(() => {
    fetchDocumentTypes();
  }, []);

  const closeAudioContext = async () => {
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      await audioContextRef.current.close();
      audioContextRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      closeAudioContext();
    };
  }, []);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 264) + "px";
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        docTypesRef.current &&
        !docTypesRef.current.contains(event.target as Node)
      ) {
        setShowDocTypes(false);
      }
    };

    if (showDocTypes) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showDocTypes]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart;

    setValue(newValue);

    // Check for @ symbol
    const lastAtIndex = newValue.lastIndexOf("@", cursorPos - 1);
    const nextSpaceIndex = newValue.indexOf(" ", lastAtIndex);

    if (
      lastAtIndex !== -1 &&
      (nextSpaceIndex === -1 || cursorPos <= nextSpaceIndex)
    ) {
      const searchTerm = newValue
        .substring(lastAtIndex + 1, cursorPos)
        .toLowerCase();
      const filtered = documentTypes.filter((doc) =>
        doc.label.toLowerCase().includes(searchTerm)
      );

      setFilteredDocTypes(filtered);
      setShowDocTypes(true);
      setAtPosition(lastAtIndex);
    } else {
      setShowDocTypes(false);
      setAtPosition(-1);
    }
  };

  const selectDocType = (docType: DocumentType) => {
    if (atPosition !== -1) {
      const beforeAt = value.substring(0, atPosition);
      const afterAt = value.substring(
        textareaRef.current?.selectionStart || atPosition
      );
      const newValue = beforeAt + docType.label + " " + afterAt;

      setValue(newValue);
      setSelectedDocType(docType.key);
      setShowDocTypes(false);
      setAtPosition(-1);

      // Focus back to textarea
      setTimeout(() => {
        textareaRef.current?.focus();
        const newPos = beforeAt.length + docType.label.length + 1;
        textareaRef.current?.setSelectionRange(newPos, newPos);
      }, 0);
    }
  };

  const updateAudioLevel = () => {
    if (analyserRef.current) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      setAudioLevel(Math.min(average / 128, 1));
      setDuration((Date.now() - recordStartTimeRef.current) / 1000);
      animationRef.current = requestAnimationFrame(updateAudioLevel);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordStartTimeRef.current = Date.now();
      audioChunksRef.current = [];

      if (
        !audioContextRef.current ||
        audioContextRef.current.state === "closed"
      ) {
        audioContextRef.current = new AudioContext();
      }

      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;

      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      updateAudioLevel();
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = async () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setAudioLevel(0);
      setDuration(0);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);

      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream
          .getTracks()
          .forEach((track) => track.stop());
      }

      await closeAudioContext();
    }
  };

  const confirmVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      const recordedDuration = duration;

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        const file = new File([audioBlob], "recording.webm", {
          type: "audio/webm",
        });
        onSendMessage("", file, recordedDuration, selectedDocType || undefined);
      };

      stopRecording();
    }
  };

  // Function to extract document type from message and remove it from text
  const extractDocumentType = (text: string) => {
    let cleanText = text;
    let docType = selectedDocType;

    // Check for any of the dynamic document types in the message
    for (const dt of documentTypes) {
      const regex = new RegExp(`${dt.label}\\s*`, "gi");
      if (regex.test(text)) {
        // Extract the label without the @ symbol (e.g., "@Guideline" becomes "Guideline")
        docType = dt.label.replace("@", "");
        // Remove the @DocumentType from the text
        cleanText = text.replace(regex, "").trim();
        break;
      }
    }

    return { cleanText, docType };
  };

  const handleSubmit = () => {
    if (value.trim()) {
      // Extract document type from message and get clean text
      const { cleanText, docType } = extractDocumentType(value);

      console.log("=== ChatInput Debug ===");
      console.log("Original value:", value);
      console.log("Clean text:", cleanText);
      console.log("Document type:", docType);
      console.log("Selected doc type:", selectedDocType);
      console.log("Document types available:", documentTypes);
      console.log("======================");

      // Send the clean text (without @DocumentType) and document type separately
      onSendMessage(cleanText, undefined, undefined, docType || undefined);
      setValue("");
      setSelectedDocType("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      showDocTypes &&
      (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter")
    ) {
      e.preventDefault();
      return;
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }

    if (e.key === "Escape") {
      setShowDocTypes(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Function to refresh document types (can be called when needed)
  // Removed unused refreshDocumentTypes

  return (
    <div className="relative w-full">
      {/* Main Input Container */}
      <div className="w-full bg-transparent border-primary border-2 rounded-2xl overflow-hidden bg-clip-padding shadow-lg mx-auto transition-all duration-300">
        <div className="flex flex-col gap-2 px-3 py-2 rounded-2xl overflow-hidden">
          {isRecording ? (
            <div className="flex items-center justify-between p-2 min-h-[40px]">
              <div className="flex items-center gap-3 flex-1">
                <Mic className="w-5 h-5 text-red-500" />
                <div className="flex items-center gap-1 flex-1">
                  {[...Array(15)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-1 bg-black rounded-full transition-all duration-150 ${
                        i < audioLevel * 15 ? "h-6" : "h-2"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-red-500 text-sm">
                  {formatDuration(duration)}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={stopRecording}
                  className="p-2 hover:bg-red-100 rounded-full transition-colors duration-200"
                >
                  <X className="w-5 h-5 text-red-500" />
                </button>
                <button
                  onClick={confirmVoiceRecording}
                  className="p-2 hover:bg-green-100 rounded-full transition-colors duration-200"
                >
                  <Check className="w-5 h-5 text-green-600" />
                </button>
              </div>
            </div>
          ) : (
            <>
              <textarea
                ref={textareaRef}
                className="resize-none border-none outline-none bg-transparent text-sm sm:text-base p-2 max-h-[264px] min-h-[40px] overflow-y-auto placeholder:text-gray-400 focus:placeholder:text-gray-300"
                placeholder="Ask something... (Type @ for document types)"
                value={value}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                rows={1}
                style={{ minHeight: 40 }}
              />
              <div className="flex flex-row justify-end items-center gap-2 relative">
                <div
                  className={`cursor-pointer hover:opacity-70 transition-all duration-300 ${
                    value.trim() ? "translate-x-0" : "translate-x-10"
                  }`}
                  onClick={startRecording}
                >
                  <Mic className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 hover:text-primary transition-colors duration-200" />
                </div>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className={`rounded-full bg-primary p-2 transition-all duration-300 hover:bg-[#8B3159] hover:scale-105 ${
                    value.trim()
                      ? "opacity-100 translate-x-0 pointer-events-auto"
                      : "opacity-0 translate-x-4 pointer-events-none"
                  }`}
                >
                  <Upload color="white" className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Document Types Dropdown - Below input with your theme */}
      {showDocTypes && (
        <div
          ref={docTypesRef}
          className="absolute top-full left-0 right-0 mt-2 bg-base-100/90 backdrop-blur-md border-2 border-primary/30 rounded-2xl shadow-xl max-h-48 overflow-y-auto z-50"
        >
          {isLoadingDocTypes ? (
            <div className="px-4 py-3 text-sm text-gray-400 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading document types...
            </div>
          ) : filteredDocTypes.length > 0 ? (
            filteredDocTypes.map((docType) => (
              <div
                key={docType.key}
                className="px-4 py-3 hover:bg-primary/10 cursor-pointer text-sm transition-colors duration-200 border-b border-primary/10 last:border-b-0 first:rounded-t-2xl last:rounded-b-2xl"
                onClick={() => selectDocType(docType)}
              >
                <span className="font-medium text-primary">
                  {docType.label}
                </span>
              </div>
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-gray-400">
              {documentTypes.length === 0
                ? "No document types available"
                : "No document types found"}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
