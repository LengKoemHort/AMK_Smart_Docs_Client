"use client";

import { Button } from "@/components/ui/button";
import { Trash2, MoreVertical } from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import Loading from "./loading";
import { useRouter } from "next/navigation";

interface ActionMenuProps {
  id: string;
  showUpdateButton?: boolean;
  showDeleteButton?: boolean;
  showRestoreButton?: boolean;
  onDelete?: () => void;
  onRestore?: () => void;
  isVectorProcessed?: boolean;
  showIsVectorProcessed?: boolean;
}

export default function ActionMenu({
  id,
  showUpdateButton = false,
  showDeleteButton = false,
  showRestoreButton = false,
  onDelete,
  onRestore,
  isVectorProcessed,
  showIsVectorProcessed = true,
}: ActionMenuProps) {
  const router = useRouter();
  const [showActions, setShowActions] = useState(false);
  const [mode, setMode] = useState("buttons-right");

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 1100) {
        setMode("buttons-right");
      } else if (width >= 1024 && width < 1100) {
        setMode("dropdown");
      } else {
        setMode("buttons-left");
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="relative">
      {mode === "buttons-right" && (
        <div className="flex gap-2 justify-end items-center">
          {showUpdateButton && (
            <Button
              onClick={() => router.push(`/d/update/${id}`)}
              className="bg-primary text-sm"
            >
              Update
            </Button>
          )}
          {showDeleteButton && (
            <Button onClick={onDelete} className="bg-red-600 hover:bg-red-800">
              <Trash2 size={16} color="white" />
            </Button>
          )}
          {showRestoreButton && (
            <Button
              onClick={onRestore}
              className="bg-green-600 hover:bg-green-800"
            >
              Restore
            </Button>
          )}
          {showIsVectorProcessed && (
            <Loading isVectorProcessed={isVectorProcessed} />
          )}
        </div>
      )}

      {mode === "dropdown" && (
        <div className="flex justify-end items-center gap-2">
          <Button
            size="sm"
            className="bg-gray-400/75 dark:bg-gray-700 flex items-center justify-center w-8 h-8 p-0"
            onClick={() => setShowActions(!showActions)}
          >
            <MoreVertical size={20} />
          </Button>
          {showActions && (
            <div className="absolute right-0 top-10 flex flex-col gap-2 bg-base-100 p-2 rounded shadow-lg z-20 w-28">
              {showUpdateButton && (
                <Link href={`/d/update/${id}`}>
                  <Button className="bg-primary text-sm w-full">Update</Button>
                </Link>
              )}
              {showDeleteButton && (
                <Button
                  onClick={onDelete}
                  className="bg-red-600 hover:bg-red-800 w-full"
                >
                  <Trash2 size={16} color="white" />
                </Button>
              )}
              {showRestoreButton && (
                <Button
                  onClick={onRestore}
                  className="bg-green-600 hover:bg-green-800 w-full"
                >
                  Restore
                </Button>
              )}
            </div>
          )}
          {showIsVectorProcessed && (
            <Loading isVectorProcessed={isVectorProcessed} />
          )}
        </div>
      )}

      {mode === "buttons-left" && (
        <div className="flex gap-2 justify-start items-center">
          {showUpdateButton && (
            <Link href={`/d/update/${id}`}>
              <Button className="bg-primary text-sm">Update</Button>
            </Link>
          )}
          {showDeleteButton && (
            <Button onClick={onDelete} className="bg-red-600 hover:bg-red-800">
              <Trash2 size={16} color="white" />
            </Button>
          )}
          {showRestoreButton && (
            <Button
              onClick={onRestore}
              className="bg-green-600 hover:bg-green-800"
            >
              Restore
            </Button>
          )}
          {showIsVectorProcessed && (
            <Loading isVectorProcessed={isVectorProcessed} />
          )}
        </div>
      )}
    </div>
  );
}
