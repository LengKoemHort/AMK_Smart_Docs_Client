"use client";

import {
  restoreDocument,
  softDeleteDocument,
  viewDocumentDownloadPrivilege,
} from "@/services/documents/document.service";
import { DocumentProps } from "@/types/document-type";
import Image from "next/image";
import React, { useState } from "react";
import ConfirmDialog from "./confirm-delete";
import { documentCardGrid } from "./table-grid";
import ActionMenu from "./action-menu";
import PDFModal from "./pdf-modal";
import { useUser } from "@/context/UserContext";

const formatDate = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
};

const departmentColorMap: Record<string, string> = {
  HR: "bg-yellow-500",
  Finance: "bg-orange-500",
  IT: "bg-indigo-500",
  Marketing: "bg-green-500",
  Sales: "bg-blue-500",
  default: "bg-violet-500",
};

interface DocumentCardProps extends DocumentProps {
  disableViewFile?: boolean;
  showDeleteButton?: boolean;
  showRestoreButton?: boolean;
  showUpdateButton?: boolean;
  onRestore?: () => void;
  isVectorProcessed?: boolean;
  showIsVectorProcessed?: boolean;
}

export default function DocumentCard({
  id,
  title,
  code,
  version,
  file_size,
  publisher_name,
  published_date,
  department,
  document_type,
  showDeleteButton = true,
  showRestoreButton = false,
  showUpdateButton = false,
  disableViewFile = false,
  isVectorProcessed,
  showIsVectorProcessed,
}: DocumentCardProps) {
  const { hasDownloadPrivilege } = useUser();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    try {
      await softDeleteDocument(id);
    } catch (error) {
      console.error("Failed to delete document", error);
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  const handleRestore = async () => {
    try {
      await restoreDocument(id);
    } catch (error) {
      console.error("Failed to restore document", error);
    } finally {
      setIsRestoreDialogOpen(false);
    }
  };

  const handleOpenDocument = async () => {
    if (hasDownloadPrivilege) {
      await viewDocumentDownloadPrivilege(id);
    } else {
      setOpen(true);
    }
  };

  return (
    <>
      <div className="bg-base-100 rounded shadow p-4 w-full">
        <div className={`grid gap-4 items-center ${documentCardGrid}`}>
          <div className="flex items-center gap-2">
            <div className="w-[25px] h-[35px] flex-shrink-0">
              <button
                onClick={handleOpenDocument}
                disabled={disableViewFile}
                className="hover:cursor-pointer"
              >
                <Image src="/pdf-logo.png" alt="PDF" width={25} height={35} />
              </button>
            </div>

            <div>
              <div
                className="font-medium lg:w-[10rem] w-[8rem] truncate"
                title={title}
              >
                {title}
              </div>
              <div className="text-sm text-base-content/50">{code}</div>
            </div>
          </div>

          <div className="w-full flex items-center justify-center">
            <div className="w-10 h-5 rounded-full flex justify-center items-center text-white text-xs bg-red-500">
              v{version}
            </div>
          </div>
          <div className="text-sm font-semibold w-full items-center justify-center flex">
            <div>{file_size}</div>
          </div>

          <div className="flex items-center gap-2 justify-center">
            <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-800 flex items-center justify-center font-semibold text-xs">
              {publisher_name?.split(" ").map((n) => n[0])}
            </div>
            <div>
              <p className="text-sm font-medium">{publisher_name}</p>
              <p className="text-sm">{formatDate(published_date)}</p>
            </div>
          </div>

          <div className="text-sm flex justify-center self-center items-center font-semibold w-full">
            <div className="bg-gray-300 dark:bg-gray-800 px-1.5 ">
              {document_type}
            </div>
          </div>

          <span
            className={`min-w-20 text-white text-sm px-2 py-1 rounded-full text-center w-full ${
              departmentColorMap[department] || departmentColorMap.default
            }`}
          >
            <div>{department}</div>
          </span>

          <ActionMenu
            id={id}
            showUpdateButton={showUpdateButton}
            showDeleteButton={showDeleteButton}
            showRestoreButton={showRestoreButton}
            onDelete={() => setIsDeleteDialogOpen(true)}
            onRestore={() => setIsRestoreDialogOpen(true)}
            isVectorProcessed={isVectorProcessed}
            showIsVectorProcessed={showIsVectorProcessed}
          />
        </div>
      </div>
      <ConfirmDialog
        cls={"btn btn-error text-white bg-red-500 hover:bg-red-600"}
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onDelete={handleDelete}
        title={"Delete Document?"}
        prompt={
          "Are you sure you want to delete this document? This action cannot be undone!"
        }
        btnLabel={"Delete"}
      />
      <ConfirmDialog
        cls={
          "btn btn-warn text-white bg-green-700 hover:bg-green-800 rounded-sm"
        }
        isOpen={isRestoreDialogOpen}
        onClose={() => setIsRestoreDialogOpen(false)}
        onDelete={handleRestore}
        title={"Restore Document?"}
        prompt={"Are you sure you want to restore this document?"}
        btnLabel={"Restore"}
      />
      <PDFModal isOpen={open} onClose={() => setOpen(false)} documentId={id} />
    </>
  );
}
