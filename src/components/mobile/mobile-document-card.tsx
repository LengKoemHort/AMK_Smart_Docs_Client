"use client";
import Loading from "@/app/(main)/_document-management/(components)/loading";
import PDFModal from "@/app/(main)/_document-management/(components)/pdf-modal";
import { viewDocument } from "@/services/documents/document.service";
import { DocumentProps } from "@/types/document-type";
import Image from "next/image";
import { useState } from "react";

interface Props extends Pick<DocumentProps, "title" | "code" | "id"> {
  onOptionsClick: () => void;
  disableViewFile: boolean;
  isVectorProcessed?: boolean;
}

export default function MobileDocumentCard({
  id,
  title,
  code,
  onOptionsClick,
  disableViewFile,
  isVectorProcessed,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex gap-4">
      <div className="flex items-center justify-between ml-4 p-3 bg-base-100 rounded shadow w-full max-w-[calc(100%-2rem)]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setOpen(true);
            }}
            className="hover:cursor-pointer"
            disabled={disableViewFile}
          >
            <Image
              src="/pdf-logo.png"
              alt="PDF"
              width={24}
              height={32}
              sizes="auto"
            />
          </button>
          <div>
            <p className="font-medium">{title}</p>
            <p className="text-sm text-gray-500">{code}</p>
          </div>
        </div>
        <button onClick={onOptionsClick}>
          <span className="text-xl">⋮</span>
        </button>

        <PDFModal
          isOpen={open}
          onClose={() => setOpen(false)}
          documentId={id}
        />
      </div>
      <Loading isVectorProcessed={isVectorProcessed} />
    </div>
  );
}
