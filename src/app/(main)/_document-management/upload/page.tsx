"use client";

import SelectDropdown from "../(components)/drop-down";
import FormInput from "../(components)/form-input";
import { Button } from "@/components/ui/button";
import getDepartments from "@/services/documents/department.service";
import getDocumentTypes from "@/services/documents/document-type.service";
import { uploadDocument } from "@/services/documents/document.service";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function UploadDocumentPage() {
  const router = useRouter();

  const uploadMutation = useMutation<any, Error, FormData>({
    mutationFn: (formData) => uploadDocument(formData),
    onSuccess: () => {
      router.push("/d");
    },
    onError: () => {
      alert("Upload failed, please try again.");
    },
  });

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

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchData() {
      const deps = await getDepartments();
      setDepartments(deps);

      const docTypes = await getDocumentTypes();
      setDocumentTypes(docTypes);
    }
    fetchData();
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!file) {
      alert("Please upload a file.");
      return;
    }

    if (!selectedDepartmentId || !selectedDocTypeId) {
      alert("Please select department and document type.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("code", code);
    if (version) formData.append("version", version);
    if (unit) formData.append("unit", unit);
    if (branch) formData.append("branch", branch);
    formData.append("department_id", selectedDepartmentId);
    formData.append("type_id", selectedDocTypeId);
    if (issueDate) formData.append("issueDate", issueDate.toISOString());

    uploadMutation.mutate(formData);
  };

  return (
    <div className="w-full sm:max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="h-10 md:hidden"></div>
      <div className="flex items-center justify-between">
        <Link href={"/d/"}>
          <ArrowLeft />
        </Link>
        <h2 className="text-xl font-semibold text-center">Upload Document</h2>
        <div></div>
      </div>
      <p className="text-center text-sm">
        Please upload your document here to store and manage it directly from
        the dashboard.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File Upload */}
        <div className="border rounded-lg bg-primary/15 py-6 flex flex-col items-center justify-center">
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="xl:w-36 mb-2 bg-primary text-white"
            disabled={uploadMutation.isPending}
          >
            Upload file
          </Button>

          <input
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
            disabled={uploadMutation.isPending}
          />

          {file && <span className="text-sm mt-2">{file.name}</span>}
          {!file && <span className="text-sm">or drag file into here</span>}
        </div>

        {/* Title */}
        <FormInput
          label="Title"
          name="title"
          placeholder="Please input title of the document."
          required
          onChange={(e) => setTitle(e.target.value)}
          // disabled={uploadMutation.isPending}
        />

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
              options={documentTypes.map((dt) => ({
                label: dt.name,
                value: dt.id,
              }))}
              value={selectedDocTypeId}
              onValueChange={setSelectedDocTypeId}
              placeholder="-Select document type-"
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
              options={departments.map((d) => ({
                label: d.name,
                value: d.id,
              }))}
              value={selectedDepartmentId}
              onValueChange={setSelectedDepartmentId}
              placeholder="-Select department-"
            />
          </div>
        </div>

        {/* Issue Date */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">
            <div className="flex gap-x-2">
              <div>Issue Date</div>
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
            disabled={uploadMutation.isPending}
          />
        </div>

        <div className="flex justify-center">
          <Button
            type="submit"
            className="w-1/4 min-w-16 mt-4 bg-primary text-white"
            disabled={uploadMutation.isPending}
          >
            {uploadMutation.isPending ? (
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
