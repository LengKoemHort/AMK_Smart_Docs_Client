"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar/Sidebar";
import Header from "@/components/Header/Header";
import MobileHeader from "@/components/mobile/mobile-header";
import MobileSidebar from "@/components/mobile/mobile-sidebar";
import useIsMobile from "@/context/IsMobileContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ChatProvider } from "@/context/ChatContext";
import { getAccessToken } from "@/lib/token-store";
import { useRouter } from "next/navigation";
import { UserProvider } from "@/context/UserContext";
import { LoadingScreen } from "@/components/LoadingScreen";

const queryClient = new QueryClient();

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.replace("/login");
    } else {
      setAuthChecked(true);
    }
  }, [router]);

  if (!authChecked) {
    return <LoadingScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <ChatProvider>
          <div className="flex h-screen">
            {/* Desktop Sidebar */}
            <div className="hidden md:flex md:h-screen md:flex-shrink-0 bg-base border-r border-base-200">
              <Sidebar
                open={sidebarOpen}
                setOpen={setSidebarOpen}
                isMobile={false}
              />
            </div>

            <div className="flex flex-col flex-1 min-h-0">
              {/* Desktop Header */}
              <div className="hidden md:block h-16">
                <Header
                  sidebarOpen={sidebarOpen}
                  setSidebarOpen={setSidebarOpen}
                />
              </div>

              {/* Mobile Header */}
              <div className="block md:hidden">
                <MobileHeader
                  sidebarOpen={sidebarMobileOpen}
                  setSidebarOpen={setSidebarMobileOpen}
                />
              </div>

              {/* Mobile Sidebar */}
              {isMobile && sidebarMobileOpen && (
                <MobileSidebar
                  open={sidebarMobileOpen}
                  setOpen={setSidebarMobileOpen}
                  isMobile={isMobile}
                />
              )}

              <main className="flex-1 bg-base-200 p-4 overflow-auto">
                {children}
              </main>
            </div>
          </div>

          <div id="popup-root" />
        </ChatProvider>
      </UserProvider>
    </QueryClientProvider>
  );
}
