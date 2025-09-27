"use client";

import { useRef, useEffect } from "react";

interface Option {
  label: string;
  value: string;
}

interface SelectDropdownProps {
  options: Option[];
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  placeholder?: string;
  className?: string;
}

export default function SelectDropdown({
  options,
  onValueChange,
  value,
  placeholder,
  className,
}: Omit<SelectDropdownProps, "defaultValue"> & { value?: string }) {
  const dropdownRef = useRef<HTMLDetailsElement>(null);
  const selectedLabel =
    value === "all"
      ? "All Departments"
      : options.find((opt) => opt.value === value)?.label || placeholder;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        dropdownRef.current.removeAttribute("open");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <details className={`dropdown ${className}`} ref={dropdownRef}>
      <summary className="btn border-0 bg-base-100 font-normal text-base-content/50 w-full rounded-md drop-shadow-xs flex items-center justify-between">
        <span>{selectedLabel}</span>
      </summary>
      <ul className="menu dropdown-content bg-base-100 text-base-content rounded-box z-10 p-2 shadow-sm">
        {options.map((option, index) => (
          <li key={`${index}`}>
            <a
              onClick={() => {
                onValueChange?.(option.value);
                dropdownRef.current?.removeAttribute("open");
              }}
            >
              {option.label}
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
}
