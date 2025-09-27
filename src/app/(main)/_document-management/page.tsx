"use client";

import DocumentCard from "./(components)/document-card";
import SelectDropdown from "./(components)/drop-down";
import MobileDocumentCard from "@/components/mobile/mobile-document-card";
import MobileDocumentDetail from "@/components/mobile/mobile-document-detail";
import MobileDocumentHeader from "@/components/mobile/mobile-document-header";
import MobileDocumentOptions from "@/components/mobile/mobile-document-options";
import { Button } from "@/components/ui/button";
import useIsMobile from "@/context/IsMobileContext";
import getDepartments from "@/services/documents/department.service";
import getDocumentTypes from "@/services/documents/document-type.service";
import {
  getAllDocuments,
  getDocumentsByPage,
  getUserProfile,
} from "@/services/documents/document.service";
import { departmentShortMap, DocumentProps } from "@/types/document-type";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import TableHeader from "./(components)/table-header";
import Pignation from "../_chatbot/(components)/Pignation";
import { useUser } from "@/context/UserContext";

interface Option {
  label: string;
  value: string;
}

interface FilteredDocument extends DocumentProps {}

export const table_headers = [
  "Title",
  "Version",
  "Size",
  "Published",
  "Document Type",
  "Department",
  "\u00A0",
];

export default function DocumentManagement() {
  const { user, hasDownloadPrivilege, hasAdminPrivilege } = useUser();

  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["documents", currentPage],
    queryFn: () => getDocumentsByPage(currentPage),
  });

  const documents = data?.documents || [];
  const hasNextPage = data?.hasNextPage ?? false;
  const hasPreviousPage = data?.hasPreviousPage ?? false;

  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: getDepartments,
  });

  const { data: documentTypes = [] } = useQuery({
    queryKey: ["documentTypes"],
    queryFn: getDocumentTypes,
  });

  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("all");
  const [docType, setDocType] = useState("all");
  const [period, setPeriod] = useState("latest");

  const buildOptions = (
    source: string[] | Record<string, string> | { id: string; name: string }[]
  ): Option[] => {
    const baseOptions = Array.isArray(source)
      ? typeof source[0] === "string"
        ? (source as string[]).map((item) => ({ label: item, value: item }))
        : (source as { id: string; name: string }[]).map((item) => ({
            label: item.name,
            value: item.name,
          }))
      : Object.entries(source).map(([label, value]) => ({ label, value }));

    return [{ label: "All", value: "all" }, ...baseOptions];
  };

  const filteredDocs: FilteredDocument[] = (
    (documents as DocumentProps[]) ?? []
  )
    .filter(
      (doc: DocumentProps) =>
        (department === "all" || doc.department === department) &&
        (docType === "all" || doc.document_type === docType) &&
        doc.title.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a: DocumentProps, b: DocumentProps) => {
      const dateA = new Date(a.published_date);
      const dateB = new Date(b.published_date);
      return period === "latest"
        ? dateB.getTime() - dateA.getTime()
        : dateA.getTime() - dateB.getTime();
    });

  useEffect(() => {
    setCurrentPage(1);
  }, [search, department, docType, period]);

  // mobile
  const isMobile = useIsMobile();
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [selectedDocument, setSelectedDocument] =
    useState<DocumentProps | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const handleOpenOptions = (id: string) => {
    setSelectedDocId(id);
    setShowOptions(true);
  };

  const handleCloseOptions = () => {
    setShowOptions(false);
    setSelectedDocId(null);
  };

  const handleView = (docId: string) => {
    const doc = documents.find((d: any) => d.id === docId);
    setSelectedDocument(doc || null);
    setShowDetailModal(true);
  };

  useEffect(() => {
    if (showOptions) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [showOptions]);

  // hydration, remember mobile state
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) return null;

  return (
    <>
      {/* Mobile layout */}
      {isMobile ? (
        <div className="h-full flex flex-col bg-base-200 pt-20 md:pt-6">
          {/* Fixed header */}
          <MobileDocumentHeader
            setSearch={setSearch}
            search={search}
            documentTypes={documentTypes}
            setDepartment={setDepartment}
            setDocType={setDocType}
            docType={docType}
            setPeriod={setPeriod}
            buildOptions={buildOptions}
          />

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto space-y-4">
            {filteredDocs.map((document) => (
              <MobileDocumentCard
                key={document.id}
                id={document.id}
                title={document.title}
                code={document.code}
                onOptionsClick={() => handleOpenOptions(document.id)}
                disableViewFile={false}
                isVectorProcessed={document.is_vector_processed}
              />
            ))}
            <Pignation
              currentPage={currentPage}
              hasNextPage={hasNextPage}
              hasPreviousPage={hasPreviousPage}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>

          {/* options box */}
          <MobileDocumentOptions
            isOpen={showOptions}
            selectedDocId={selectedDocId}
            onView={handleView}
            onClose={handleCloseOptions}
            showDeleteButton={true}
            showRestoreButton={false}
          />
          <MobileDocumentDetail
            isOpen={showDetailModal}
            document={selectedDocument}
            onClose={() => setShowDetailModal(false)}
          />
        </div>
      ) : (
        <div className="h-full flex flex-col bg-base-200">
          {/* Desktop layout */}
          <div className="flex-shrink-0">
            <div className="p-4 sm:p-6 max-w-7xl mx-auto">
              {/* Search and Upload */}
              <div className="flex flex-col lg:justify-between gap-4 justify-start md:flex-row md:items-center sticky top-16 md:top-0 py-4">
                <input
                  type="text"
                  placeholder="Search for document"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full md:w-96 py-2 px-4 rounded-lg drop-shadow-xs bg-base-100"
                />

                {hasAdminPrivilege && (
                  <Link href="/d/upload">
                    <Button className="bg-primary w-full md:w-28">
                      Upload
                    </Button>
                  </Link>
                )}
              </div>

              {/* filters */}
              <div className="flex flex-col sm:flex-row flex-wrap gap-4 sticky top-36 md:top-20 pb-4 z-5">
                <SelectDropdown
                  onValueChange={setDepartment}
                  options={buildOptions(departmentShortMap)}
                  value={department}
                  placeholder="Departments: All"
                />

                <SelectDropdown
                  onValueChange={setPeriod}
                  placeholder={`Period: ${period}`}
                  options={[
                    { label: "Latest to earliest", value: "latest" },
                    { label: "Earliest to latest", value: "earliest" },
                  ]}
                />

                <SelectDropdown
                  onValueChange={setDocType}
                  placeholder={`${
                    docType === "all" ? "All Document Type" : docType
                  }`}
                  options={buildOptions(documentTypes)}
                />
              </div>
            </div>
          </div>

          {/* Scrollable content area */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              {/* Table header - Sticky within scroll container */}
              <div className="sticky top-0 bg-base-100 z-1">
                <TableHeader headers={table_headers} />
              </div>

              {/* documents */}
              <div className="space-y-4 mt-4">
                {filteredDocs.map((document) => (
                  <DocumentCard
                    key={document.id}
                    id={document.id}
                    document_type={document.document_type}
                    title={document.title}
                    code={document.code}
                    version={document.version}
                    file_size={document.file_size}
                    publisher_name={document.publisher_name}
                    published_date={document.published_date}
                    department={document.department}
                    total_versions={document.total_versions}
                    showDeleteButton={hasAdminPrivilege}
                    showRestoreButton={false}
                    showUpdateButton={hasAdminPrivilege}
                    isVectorProcessed={document.is_vector_processed}
                  />
                ))}

                <Pignation
                  currentPage={currentPage}
                  hasNextPage={hasNextPage}
                  hasPreviousPage={hasPreviousPage}
                  onPageChange={(page) => setCurrentPage(page)}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
