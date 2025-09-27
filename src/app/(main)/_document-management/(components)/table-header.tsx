"use client";

import { documentCardGrid } from "./table-grid";

interface TableHeaderProps {
  headers: string[];
}

export default function TableHeader({ headers }: TableHeaderProps) {
  return (
    <div
      className={`sticky top-0 pb-2 hidden lg:grid ${documentCardGrid} 
      place-items-center items-center gap-4 font-semibold text-sm px-4 py-2 
      rounded drop-shadow-xs z-10
      `}
    >
      {headers.map((header, idx) => (
        <div
          key={idx}
          className={idx === headers.length - 1 ? "min-w-[2rem]" : ""}
        >
          {header}
        </div>
      ))}
    </div>
  );
}
