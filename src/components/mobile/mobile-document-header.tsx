import SelectDropdown from "@/app/(main)/_document-management/(components)/drop-down";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { departmentShortMap } from "@/types/document-type";
import Link from "next/link";
import React from "react";

interface Option {
  label: string;
  value: string;
}

interface MobileDocumentHeaderProps {
  setSearch: (value: string) => void;
  search: string;
  documentTypes: Option[];
  setDepartment: (value: string) => void;
  buildOptions: (input: any) => Option[];
  setPeriod: (value: string) => void;
  docType: string;
  setDocType: (value: string) => void;
}

export default function MobileDocumentHeader({
  setSearch,
  search,
  documentTypes,
  setDepartment,
  buildOptions,
  setPeriod,
  docType,
  setDocType,
}: MobileDocumentHeaderProps) {
  return (
    <div className="bg-base-200">
      {/* Fixed header section */}
      <div className="sticky top-0 z-10 bg-base-200 px-4 mr-2 pb-4">
        {/* Search and Upload */}
        <div className="flex lg:justify-between gap-2 mb-6 mr-6 justify-start md:flex-row md:items-center">
          <input
            type="text"
            placeholder="Search for document"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-96 py-2 px-4 rounded-lg bg-base-100 drop-shadow-xs"
          />

          <Link href="/d/upload">
            <Button className="bg-primary w-full md:w-28">Upload</Button>
          </Link>
        </div>

        {/* filters */}
        <div className="flex flex-col sm:flex sm:flex-row justify-start gap-2 mb-6 w-[95%]">
          <SelectDropdown
            onValueChange={setDepartment}
            options={buildOptions(departmentShortMap)}
            placeholder="Departments"
          />

          <SelectDropdown
            onValueChange={setPeriod}
            placeholder="Period"
            options={[
              { label: "Latest to earliest", value: "latest" },
              { label: "Earliest to latest", value: "earliest" },
            ]}
          />

          <SelectDropdown
            onValueChange={setDocType}
            placeholder={`File type`}
            options={buildOptions(documentTypes)}
          />
        </div>
      </div>
    </div>
  );
}
