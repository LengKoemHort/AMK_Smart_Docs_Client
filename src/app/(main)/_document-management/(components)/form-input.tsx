"use client";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormInputProps {
  label: string;
  name: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  className?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function FormInput({
  label,
  name,
  placeholder,
  type = "text",
  required = false,
  className,
  value,
  onChange,
}: FormInputProps) {
  return (
    <div className="flex flex-col gap-1 w-full">
      <Label htmlFor={name} className="text-sm font-medium ml-2">
        {label} {required && <div className="text-red-500">*</div>}
      </Label>
      <input
        id={name}
        name={name}
        placeholder={placeholder}
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        className={cn("input input-bordered w-full", className)}
      />
    </div>
  );
}
