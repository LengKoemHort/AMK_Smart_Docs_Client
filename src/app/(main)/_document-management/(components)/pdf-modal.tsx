"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { viewDocument } from "@/services/documents/document.service";
import { BookOpenText, ChevronsDown, X } from "lucide-react";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

interface PDFModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
}

export default function PDFModal({
  isOpen,
  onClose,
  documentId,
}: PDFModalProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pdfData, setPdfData] = useState<Uint8Array | null>(null);
  const [pageWidth, setPageWidth] = useState<number>(
    typeof window !== "undefined" && window.innerWidth <= 1024
      ? window.innerWidth - 10
      : 800
  );
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scrollMode, setScrollMode] = useState<boolean>(false);

  // Memoized copy of PDF data to avoid unnecessary reloads & DataCloneError
  const fileProp = useMemo(() => {
    if (!pdfData) return null;
    return { data: new Uint8Array(pdfData) };
  }, [pdfData]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const updateWidth = () => {
      if (window.innerWidth > 1024) {
        setPageWidth(800);
      } else {
        setPageWidth(window.innerWidth - 10); // small padding
      }
    };

    updateWidth(); // run on mount
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  useEffect(() => {
    if (isOpen) {
      viewDocument(documentId)
        .then((data) => {
          if (data) {
            setPdfData(new Uint8Array(data));
            setNumPages(0);
          } else {
            setPdfData(null);
          }
        })
        .catch(() => setPdfData(null));
    }
  }, [isOpen, documentId]);

  useEffect(() => {
    if (!isOpen) {
      setPdfData(null);
      setNumPages(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black m-0 w-screen"
    >
      <button
        className="z-10 btn btn-ghost btn-circle btn-sm bg-black text-white absolute top-1 right-1"
        onClick={() => {
          onClose();
        }}
      >
        <X />
      </button>

      <div className="z-10 flex justify-center items-center px-2 pt-1 pb-0.5 absolute top-1/2 right-1 bg-gray-900 rounded-md">
        <button onClick={() => setScrollMode((prev) => !prev)}>
          {scrollMode ? <ChevronsDown /> : <BookOpenText />}
        </button>
      </div>

      <div className="bg-white rounded shadow-lg w-fit max-w-5xl h-[100%] overflow-auto">
        {pdfData ? (
          <Document
            key={documentId + (pdfData ? pdfData.byteLength : 0)}
            file={fileProp}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            loading={<p>Loading PDF...</p>}
            noData={<p>No PDF data available</p>}
            error={<p>Failed to load PDF</p>}
          >
            {scrollMode ? (
              Array.from(new Array(numPages), (_, i) => (
                <Page
                  key={`page_${i + 1}`}
                  pageNumber={i + 1}
                  renderAnnotationLayer={false}
                  renderTextLayer={false}
                  width={pageWidth}
                />
              ))
            ) : (
              <Page
                key={`page_${pageNumber}`}
                pageNumber={pageNumber}
                renderAnnotationLayer={false}
                renderTextLayer={false}
                width={pageWidth}
              />
            )}
          </Document>
        ) : (
          <p>Loading PDF...</p>
        )}

        {!scrollMode && numPages > 1 && (
          <div className="flex justify-between items-center p-2">
            <button
              className="btn btn-sm"
              onClick={() => setPageNumber((p) => Math.max(p - 1, 1))}
              disabled={pageNumber <= 1}
            >
              Prev
            </button>
            <div className="text-black">
              Page {pageNumber} of {numPages}
            </div>
            <button
              className="btn btn-sm"
              onClick={() => setPageNumber((p) => Math.min(p + 1, numPages))}
              disabled={pageNumber >= numPages}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
