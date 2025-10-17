"use client";

import SelectDropdown from "../../(components)/drop-down";
import FormInput from "../../(components)/form-input";
import { Button } from "@/components/ui/button";
import getDepartments from "@/services/documents/department.service";
import getDocumentTypes from "@/services/documents/document-type.service";
import {
  getAllDocuments,
  getDocumentDetail,
  restoreDocument,
  softDeleteDocumentActive,
  updateDocumentVersion,
  uploadDocumentNewVersion,
} from "@/services/documents/document.service";
import { DocumentProps } from "@/types/document-type";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function UploadDocumentPage() {
  const router = useRouter();
  const params = useParams();

  if (typeof params?.id !== "string") {
    throw new Error("Invalid or missing document ID.");
  }
  const documentId = params.id;

  const { data: documents = [] } = useQuery({
    queryKey: ["documents"],
    queryFn: getAllDocuments,
  });

  const { data: documentDetail = [] } = useQuery({
    queryKey: ["document_id", documentId],
    queryFn: () => getDocumentDetail(documentId),
    enabled: !!documentId,
  });

  const documentData = documents.find(
    (doc: DocumentProps) => doc.id === documentId
  );

  const [file, setFile] = useState<File | null>(null);
  const [departments, setDepartments] = useState<
    { id: string; name: string }[]
  >([]);
  const [documentTypes, setDocumentTypes] = useState<
    { id: string; name: string }[]
  >([]);

  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [selectedDocTypeId, setSelectedDocTypeId] = useState("");

  const [branch, setBranch] = useState("");
  const [issueDate, setIssueDate] = useState<Date | null>(null);
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [version, setVersion] = useState("");
  const [unit, setUnit] = useState("");
  const [isActive, setIsActive] = useState<boolean>(false);
  const originalActive = useRef<boolean | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFileNewVersion = useMutation({
    mutationFn: (formData: FormData) =>
      uploadDocumentNewVersion(formData, documentId),
    onSuccess: () => {
      router.back();
    },
    onError: () => {
      alert("Uploading a Document new Version failed, please try again.");
    },
  });

  const updateMutationWithoutFile = useMutation({
    mutationFn: (formData: FormData) =>
      updateDocumentVersion(formData, documentId),
    onSuccess: () => {
      router.back();
    },
    onError: () => {
      alert("Updating Document failed, please try again.");
    },
  });

  useEffect(() => {
    if (documentData) {
      setTitle(documentData.title);
      setVersion(documentData.version || "");
      setSelectedDepartmentId(documentData.department_id);
      setSelectedDocTypeId(documentData.type_id);
      setIssueDate(documentData.issue_date?.split("T")[0] || "");
    }
  }, [documentData]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!documentData) return;

    const formData = new FormData();

    if (file) formData.append("file", file);
    if (title) formData.append("title", title);
    if (code) formData.append("code", code);
    if (version) formData.append("version", version);
    if (unit) formData.append("unit", unit);
    if (branch) formData.append("branch", branch);

    formData.append(
      "department_id",
      selectedDepartmentId || documentDetail.department
    );
    formData.append("type_id", selectedDocTypeId || documentDetail.type);
    formData.append(
      "issue_date",
      issueDate || documentData.issue_date?.split("T")[0]
    );

    const hasFile =
      formData.has("file") && formData.get("file") instanceof File;

    if (isActive !== originalActive.current) {
      if (!isActive) {
        await softDeleteDocumentActive(documentId);
        router.back();
        return;
      } else {
        await restoreDocument(documentId);
        router.push("/document-management/archive");
        return;
      }
    }

    if (hasFile) {
      uploadFileNewVersion.mutate(formData);
    } else {
      updateMutationWithoutFile.mutate(formData);
    }
  };

  useEffect(() => {
    if (documentDetail?.is_active !== undefined) {
      setIsActive(documentDetail.is_active);
      originalActive.current = documentDetail.is_active;
    }

    if (documentDetail?.department_id) {
      setSelectedDepartmentId(documentDetail.department_id);
    }
  }, [documentDetail]);

  useEffect(() => {
    async function fetchData() {
      const deps = await getDepartments();
      setDepartments(deps);

      const docTypes = await getDocumentTypes();
      setDocumentTypes(docTypes);
    }
    fetchData();
  }, []);

  return (
    <div className="w-full sm:max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between mt-14">
        <button onClick={() => router.back()}>
          <ArrowLeft />
        </button>
        <h2 className="text-xl font-semibold text-center">Update Document</h2>
        <div></div>
      </div>
      <p className="text-center text-sm">
        Please upload your document here to store and manage it directly from
        the dashboard.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* File Upload */}
        <div className="border rounded-lg bg-primary/15 py-6 flex flex-col items-center justify-center">
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="xl:w-36 mb-2 bg-primary text-white"
            disabled={
              uploadFileNewVersion.isPending ||
              updateMutationWithoutFile.isPending
            }
          >
            Upload file
          </Button>

          <input
            required={false}
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setFile(e.target.files[0]);
              } else {
                setFile(null);
              }
            }}
            disabled={
              uploadFileNewVersion.isPending ||
              updateMutationWithoutFile.isPending
            }
          />

          {file && <span className="text-sm mt-2">{file.name}</span>}
          {!file && <span className="text-sm">or drag file into here</span>}
        </div>

        {/* Title and Version */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Title"
            name="title"
            placeholder="Please input title of the document."
            required={false}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <FormInput
            label="Version"
            name="version"
            placeholder="Please input document’s version."
            required={false}
            value={version}
            onChange={(e) => setVersion(e.target.value)}
          />
        </div>

        {/* Document Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium flex">
              <div className="flex gap-x-2">
                <div>Document Type</div>
                <div className="text-red-500">*</div>
              </div>
            </label>

            <SelectDropdown
              className="w-full"
              options={documentTypes.map((d) => ({
                label: d.name,
                value: d.id,
              }))}
              value={selectedDocTypeId}
              onValueChange={setSelectedDocTypeId}
              placeholder={documentDetail.type_name || "-Select department-"}
            />
          </div>

          {/* Department */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">
              <div className="flex gap-x-2">
                <div>Department</div>
                <div className="text-red-500">*</div>
              </div>
            </label>
            <SelectDropdown
              className="w-full"
              options={departments.map((d) => ({ label: d.name, value: d.id }))}
              value={selectedDepartmentId}
              onValueChange={setSelectedDepartmentId}
              placeholder={
                documentDetail.department_name || "-Select department-"
              }
            />
          </div>
        </div>

        {/* Issue Date */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">
            <div className="flex gap-x-2">
              <div>Effective Date</div>
              <div className="text-red-500">*</div>
            </div>
          </label>

          <DatePicker
            selected={issueDate}
            onChange={(date: Date | null) => setIssueDate(date)}
            dateFormat="dd/MM/yy"
            placeholderText="dd/mm/yy"
            className="w-full bg-base-100 px-3 py-2 rounded-md"
            required
            disabled={
              uploadFileNewVersion.isPending ||
              updateMutationWithoutFile.isPending
            }
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isActive}
            className="toggle toggle-secondary w-10 border rounded-2xl"
            onChange={(e) => setIsActive(e.target.checked)}
          />

          <legend className="fieldset-legend">
            {isActive ? "Active" : "Inactive"}
          </legend>
        </div>

        <div className="flex justify-center">
          <Button
            type="submit"
            className="w-1/4 min-w-16 bg-primary text-white"
            disabled={
              uploadFileNewVersion.isPending ||
              updateMutationWithoutFile.isPending
            }
          >
            {uploadFileNewVersion.isPending ||
            updateMutationWithoutFile.isPending ? (
              <div className="flex gap-1">
                <span className="font-bold">Loading</span>
                <span className="loading loading-dots loading-xs mt-1"></span>
              </div>
            ) : (
              "Confirm"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
