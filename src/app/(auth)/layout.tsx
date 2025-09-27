"use client";
import React from "react";
import "@/app/globals.css";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-base-200 min-h-screen flex items-center justify-center">
      {children}
    </div>
  );
}
