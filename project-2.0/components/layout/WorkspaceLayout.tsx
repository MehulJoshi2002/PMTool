"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import { AppProvider, useAppContext } from "../../lib/AppContext";
import { AuthProvider, useAuth } from "../../lib/AuthContext";
import { XCircle, Loader2 } from "lucide-react";

const AUTH_ROUTES = ["/login", "/signup", "/forgot-password", "/reset-password"];

function LayoutContent({ children, isFullScreen }: { children: React.ReactNode; isFullScreen: boolean }) {
  const { isPresentMode, setIsPresentMode } = useAppContext();
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isAuthRoute = AUTH_ROUTES.includes(pathname);

  useEffect(() => {
    if (loading) return;
    if (!user && !isAuthRoute) {
      router.replace("/login");
    }
    if (user && isAuthRoute) {
      router.replace("/");
    }
  }, [user, loading, isAuthRoute, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0E1015] flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-blue-400" />
      </div>
    );
  }

  if (isAuthRoute) {
    return <>{children}</>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0E1015] flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-blue-400" />
      </div>
    );
  }

  if (isFullScreen || isPresentMode) {
    return (
      <div className={`relative h-screen w-full overflow-hidden bg-[#0f0f1a] ${isPresentMode ? "present-mode-active" : ""}`}>
        {children}
        {isPresentMode && (
          <button
            onClick={() => setIsPresentMode(false)}
            className="fixed bottom-6 right-6 z-[999] flex items-center gap-2 px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-100 border border-red-500/30 backdrop-blur-md rounded-xl shadow-2xl transition font-medium"
          >
            <XCircle size={18} />
            Exit Presentation
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1" style={{ marginLeft: "var(--sidebar-width, 260px)" }}>
        {children}
      </main>
    </div>
  );
}

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFullScreen = pathname === "/roadmapping";

  return (
    <AuthProvider>
      <AppProvider>
        <LayoutContent isFullScreen={isFullScreen}>{children}</LayoutContent>
      </AppProvider>
    </AuthProvider>
  );
}
