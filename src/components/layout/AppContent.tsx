"use client";

import React, { useEffect, useState, useSyncExternalStore, Suspense } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import Sidebar from "@/components/layout/Sidebar";
import LoginPage from "@/app/login/page";
import { usePathname, useRouter } from "next/navigation";
import { Menu, HardHat } from "lucide-react";
import { Button } from "@/components/ui/button";

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

function useIsMounted() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export default function AppContent({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isMounted = useIsMounted();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Route guarding and redirection
  useEffect(() => {
    if (isMounted) {
      if (!isAuthenticated && pathname !== "/login") {
        router.replace("/login");
      } else if (isAuthenticated && pathname === "/login") {
        router.replace("/");
      }
    }
  }, [isMounted, isAuthenticated, pathname, router]);

  // Auto-close menu when route changes on mobile
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  if (!isMounted) {
    // Render blank background during server-to-client hydration to prevent flashes
    return <div className="min-h-screen bg-slate-950" />;
  }

  // If not authenticated, render LoginPage directly (route guard will redirect URL next frame)
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // If user is authenticated but visiting /login, show blank during transition to /
  if (pathname === "/login") {
    return <div className="min-h-screen bg-slate-50/50" />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      {/* Mobile Top Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-navy text-white flex items-center justify-between px-4 z-40 md:hidden border-b border-navy/20">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(true)}
            className="text-white hover:bg-white/10"
          >
            <Menu className="w-6 h-6" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gold rounded-md">
              <HardHat className="w-5 h-5 text-navy" />
            </div>
            <span className="font-bold tracking-tight">Velon Cost Estimator</span>
          </div>
        </div>
      </header>

      {/* Sidebar Layout - slide in on mobile, fixed left column on desktop */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-navy text-white transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } md:fixed md:inset-y-0 md:left-0 md:z-30`}
      >
        <Suspense fallback={<div className="w-full h-full bg-navy" />}>
          <Sidebar onCloseMobile={() => setIsMobileMenuOpen(false)} />
        </Suspense>
      </aside>

      {/* Backdrop overlay for mobile drawer */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-navy/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content Pane */}
      <main className="flex-1 min-h-screen pt-20 px-4 pb-8 md:pt-8 md:px-8 md:pl-72">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
