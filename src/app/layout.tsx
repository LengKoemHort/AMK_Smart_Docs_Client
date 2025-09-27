"use client";
import React from "react";
import "@/app/globals.css";
import { Kantumruy_Pro, Poppins } from "next/font/google";

const kantumruyPro = Kantumruy_Pro({
  subsets: ["khmer"],
  display: "swap",
  variable: "--font-kantumruy-pro",
});

const poppins = Poppins({
  subsets: ["latin"],
  display: "swap",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${kantumruyPro.variable} ${poppins.variable} bg-base-200 min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
