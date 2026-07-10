import React, { useState, useRef, useEffect } from "react";
import { Outlet, useLocation, useNavigate, Navigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu, Search, Bell, MessageSquare, Zap, Sun, Moon,
  ChevronDown, Settings, LogOut, ChevronLeft,
  Megaphone, UserPlus, FileBarChart, Activity, Sparkles,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { isPortalRole, normalizeRole, canAccessPath } from "@/lib/portalConfig";
import { useTheme } from "@/lib/ThemeContext";
import PortalNav from "@/components/portal/PortalNav";
import UnibudMark from "@/components/brand/UnibudMark";
import { PortalBadge } from "@/components/portal/PortalUI";
import { useBudPanel } from "@/lib/BudPanelContext";

const QUICK_ACTIONS = [
  { label: "New Announcement", icon: Megaphone, path: "/portal/announcements", roles: ["oracle", "university_admin", "lecturer"] },
  { label: "Invite User", icon: UserPlus, path: "/portal/users", roles: ["oracle", "university_admin"] },
  { label: "View Reports", icon: FileBarChart, path: "/portal/reports", roles: ["oracle", "executive", "university_admin"] },
  { label: "System Health", icon: Activity, path: "/portal/system-health", roles: ["oracle", "executive"] },
];

export default function PortalLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, changeTheme } = useTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const { openBud } = useBudPanel();
  const profileRef = useRef(null);
  const quickActionsRef = useRef(null);

  const { data: user, isLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
    retry: false,
  });

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (quickActionsRef.current && !quickActionsRef.current.contains(e.target)) setQuickActionsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
    setProfileOpen(false);
    setQuickActionsOpen(false);
  }, [location.pathname]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-3"
        >
          <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center premium-shadow animate-pulse">
            <UnibudMark className="w-6 h-6 text-primary" />
          </div>
          <p className="text-[13px] font-medium text-muted-foreground">Loading Operations Center...</p>
        </motion.div>
      </div>
    );
  }

  if (!user || !isPortalRole(user.role)) {
    return <Navigate to="/" replace />;
  }

  const role = normalizeRole(user.role);

  if (!canAccessPath(role, location.pathname)) {
    return <Navigate to="/portal" replace />;
  }

  const isDark = document.documentElement.classList.contains("dark");
  const toggleTheme = () => changeTheme(isDark ? "light" : "dark");

  const workspaceName = role === "oracle" ? "Global Platform" : role === "executive" ? "Executive" : user?.university || "UNIBUD";

  const availableQuickActions = QUICK_ACTIONS.filter((a) => a.roles.includes(role));

  return (
    <div className="min-h-screen portal-bg flex">
      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex fixed inset-y-0 left-0 z-30 transition-all duration-300 ${sidebarCollapsed ? "w-[76px]" : "w-[260px]"}`}>
        <PortalNav user={user} collapsed={sidebarCollapsed} />
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
              className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
              className="fixed inset-y-0 left-0 w-[260px] z-50 lg:hidden"
            >
              <PortalNav user={user} onNavigate={() => setSidebarOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${sidebarCollapsed ? "lg:ml-[76px]" : "lg:ml-[260px]"}`}>
        {/* Top bar */}
        <header className="sticky top-0 z-20 glass border-b border-border/20">
          <div className="flex items-center gap-2 px-4 lg:px-6 h-16">
            {/* Mobile menu */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden w-10 h-10 rounded-[14px] flex items-center justify-center text-muted-foreground hover:bg-muted/50 spring-tap"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Desktop collapse toggle */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex w-10 h-10 rounded-[14px] items-center justify-center text-muted-foreground hover:bg-muted/50 hover:text-foreground spring-tap"
            >
              <ChevronLeft className={`w-5 h-5 transition-transform duration-300 ${sidebarCollapsed ? "rotate-180" : ""}`} />
            </button>

            {/* Global Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search anything..."
                  className="w-full h-10 pl-10 pr-4 rounded-[16px] bg-muted/50 border border-border/30 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-card transition-all"
                />
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-1.5 ml-auto">
              {/* Messages */}
              <button
                onClick={() => navigate("/portal/support")}
                className="w-10 h-10 rounded-[14px] flex items-center justify-center text-muted-foreground hover:bg-muted/50 hover:text-foreground spring-tap"
                title="Messages"
              >
                <MessageSquare className="w-[18px] h-[18px]" />
              </button>

              {/* Notifications */}
              <button
                onClick={() => navigate("/portal/notifications")}
                className="relative w-10 h-10 rounded-[14px] flex items-center justify-center text-muted-foreground hover:bg-muted/50 hover:text-foreground spring-tap"
                title="Notifications"
              >
                <Bell className="w-[18px] h-[18px]" />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-error ring-2 ring-card" />
              </button>

              {/* Quick Actions */}
              {availableQuickActions.length > 0 && (
                <div className="relative" ref={quickActionsRef}>
                  <button
                    onClick={() => setQuickActionsOpen(!quickActionsOpen)}
                    className="hidden sm:flex h-10 px-3 rounded-[14px] items-center gap-2 bg-primary/10 text-primary hover:bg-primary/15 spring-tap"
                  >
                    <Zap className="w-4 h-4" strokeWidth={2.2} />
                    <span className="text-[12px] font-semibold">Quick</span>
                  </button>
                  <AnimatePresence>
                    {quickActionsOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 top-12 w-56 rounded-[20px] glass-strong elevated-shadow p-2 z-50"
                      >
                        <p className="px-3 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Quick Actions</p>
                        {availableQuickActions.map((action) => (
                          <button
                            key={action.label}
                            onClick={() => navigate(action.path)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-[13px] font-medium text-foreground hover:bg-muted/50 transition-colors"
                          >
                            <action.icon className="w-4 h-4 text-primary" />
                            {action.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Workspace selector */}
              <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-[14px] bg-muted/50 border border-border/30">
                <div className="w-2 h-2 rounded-full bg-success" />
                <span className="text-[12px] font-semibold text-foreground max-w-[120px] truncate">{workspaceName}</span>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              </div>

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="w-10 h-10 rounded-[14px] flex items-center justify-center text-muted-foreground hover:bg-muted/50 hover:text-foreground spring-tap"
                title="Toggle theme"
              >
                {isDark ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
              </button>

              {/* Profile menu */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 h-10 pl-1.5 pr-2 rounded-[14px] hover:bg-muted/50 spring-tap"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-[12px] font-bold text-primary-foreground">
                    {user?.full_name?.charAt(0) || user?.email?.charAt(0) || "U"}
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${profileOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-12 w-64 rounded-[20px] glass-strong elevated-shadow p-2 z-50"
                    >
                      <div className="px-3 py-3 border-b border-border/20 mb-1">
                        <p className="text-[13px] font-bold text-foreground truncate">{user?.full_name || "User"}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
                        <div className="mt-2">
                          <PortalBadge role={role} />
                        </div>
                      </div>
                      <button
                        onClick={() => navigate("/portal/settings")}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-[13px] font-medium text-foreground hover:bg-muted/50 transition-colors"
                      >
                        <Settings className="w-4 h-4 text-muted-foreground" />
                        Settings
                      </button>
                      <button
                        onClick={() => navigate("/portal/announcements")}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-[13px] font-medium text-foreground hover:bg-muted/50 transition-colors"
                      >
                        <Megaphone className="w-4 h-4 text-muted-foreground" />
                        Announcements
                      </button>
                      <Link
                        to="/"
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-[13px] font-medium text-foreground hover:bg-muted/50 transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                        Back to Student App
                      </Link>
                      <div className="border-t border-border/20 mt-1 pt-1">
                        <button
                          onClick={() => base44.auth.logout("/login")}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-[13px] font-medium text-error hover:bg-error/5 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8 max-w-[1500px] w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Bud floating button */}
      <motion.button
        onClick={() => openBud()}
        whileTap={{ scale: 0.88 }}
        whileHover={{ scale: 1.05 }}
        className="fixed bottom-6 right-6 z-30 w-14 h-14 rounded-full flex items-center justify-center bg-primary text-primary-foreground shadow-[0_4px_24px_rgba(109, 40, 217,0.35)]"
        aria-label="Open Bud"
      >
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-primary"
          initial={{ scale: 1, opacity: 0.5 }}
          animate={{ scale: 1.4, opacity: 0 }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
        />
        <Sparkles className="w-6 h-6" strokeWidth={2} />
      </motion.button>
    </div>
  );
}