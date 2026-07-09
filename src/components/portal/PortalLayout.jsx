import React, { useState } from "react";
import { Outlet, useLocation, useNavigate, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Search, Bell, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { isPortalRole, normalizeRole, getRoleName, canAccessPath } from "@/lib/portalConfig";
import PortalSidebar from "@/components/portal/PortalSidebar";
import { PortalBadge } from "@/components/portal/PortalUI";

export default function PortalLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: user, isLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center premium-shadow animate-pulse">
          <span className="text-primary-foreground font-heading font-bold text-lg">U</span>
        </div>
      </div>
    );
  }

  // Redirect students back to student app
  if (!user || !isPortalRole(user.role)) {
    return <Navigate to="/" replace />;
  }

  const role = normalizeRole(user.role);

  // Check path access
  if (!canAccessPath(role, location.pathname)) {
    return <Navigate to="/portal" replace />;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-[260px] flex-shrink-0 fixed inset-y-0 left-0 z-30">
        <PortalSidebar user={user} />
      </aside>

      {/* Mobile sidebar drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
              className="fixed inset-y-0 left-0 w-[260px] z-50 lg:hidden"
            >
              <PortalSidebar user={user} onNavigate={() => setSidebarOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 lg:ml-[260px] flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-card/80 backdrop-blur-xl border-b border-border/30">
          <div className="flex items-center gap-3 px-4 lg:px-8 h-16">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full h-10 pl-9 pr-4 rounded-xl bg-muted/50 border border-border/30 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-card transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <button className="relative w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted">
                <Bell className="w-[18px] h-[18px]" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
              </button>
              <div className="hidden sm:flex items-center gap-2.5 pl-2 border-l border-border/30">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-[12px] font-bold text-primary-foreground">
                  {user?.full_name?.charAt(0) || user?.email?.charAt(0) || "U"}
                </div>
                <div className="hidden md:block">
                  <p className="text-[12px] font-semibold text-foreground leading-none">{user?.full_name || "User"}</p>
                  <div className="mt-1">
                    <PortalBadge role={role} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8 max-w-[1400px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}