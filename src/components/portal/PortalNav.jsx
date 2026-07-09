import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Activity, ScrollText, Boxes, Users, ShieldCheck, Landmark,
  LineChart, BarChart3, LifeBuoy, FileEdit, Bot, Settings, Wrench,
  Mountain, LogOut, X, ChevronLeft, Building, Layers, GraduationCap,
  BookOpen, CalendarDays, Megaphone, CheckSquare, PlayCircle, UsersRound,
  Video, ClipboardList, FolderOpen, Crown, ShoppingBag, ClipboardCheck,
  Bell, Flag,
} from "lucide-react";
import { getPortalNavigation, getRoleName, normalizeRole } from "@/lib/portalConfig";
import { base44 } from "@/api/base44Client";
import { PortalBadge } from "@/components/portal/PortalUI";
import { useFeatureFlags } from "@/lib/FeatureFlagContext";

const NAV_FLAG_MAP = {
  "/portal/marketplace": "marketplace",
  "/portal/events": "events",
  "/portal/bud-config": "bud_management",
  "/portal/content": "content",
  "/portal/support": "student_support",
  "/portal/live": "live",
  "/portal/announcements": "campus",
  "/portal/study-groups": "study_groups",
};

const ICON_MAP = {
  LayoutDashboard, Activity, ScrollText, Boxes, Users, ShieldCheck, Landmark,
  LineChart, BarChart3, LifeBuoy, FileEdit, Bot, Settings, Wrench,
  Building, Layers, GraduationCap, BookOpen, CalendarDays, Megaphone,
  CheckSquare, PlayCircle, UsersRound, Video, ClipboardList, FolderOpen,
  Crown, ShoppingBag, ClipboardCheck, Bell, Flag,
};

export default function PortalNav({ user, collapsed = false, onNavigate }) {
  const location = useLocation();
  const navigate = useNavigate();
  const role = normalizeRole(user?.role);
  const nav = getPortalNavigation(role);
  const { isModuleEnabled } = useFeatureFlags();

  const filterByFlag = (items) => items.filter((item) => {
    const flag = NAV_FLAG_MAP[item.path];
    return !flag || isModuleEnabled(flag);
  });

  const filteredNav = nav.map((section) => ({
    ...section,
    items: filterByFlag(section.items),
  })).filter((section) => section.items.length > 0);

  const handleLogout = async () => {
    await base44.auth.logout("/login");
  };

  const sidebarWidth = collapsed ? "w-[76px]" : "w-[260px]";

  return (
    <div className={`flex flex-col h-full glass-strong border-r border-border/30 transition-all duration-300 ${sidebarWidth}`}>
      {/* Logo */}
      <div className={`flex items-center gap-3 px-5 py-5 border-b border-border/20 ${collapsed ? "justify-center px-0" : ""}`}>
        <div className="w-10 h-10 rounded-[14px] bg-primary flex items-center justify-center gold-glow flex-shrink-0">
          <Mountain className="w-5 h-5 text-primary-foreground" strokeWidth={2.2} />
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="font-heading font-extrabold text-[15px] tracking-tight leading-none text-foreground">UNIBUD</p>
            <p className="text-[10px] text-muted-foreground font-medium mt-1">Operations Center</p>
          </div>
        )}
        {onNavigate && !collapsed && (
          <button onClick={onNavigate} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Role badge */}
      {!collapsed && (
        <div className="px-5 py-3 border-b border-border/20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-[12px] font-bold text-primary-foreground flex-shrink-0">
              {user?.full_name?.charAt(0) || user?.email?.charAt(0) || "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-semibold text-foreground truncate">{user?.full_name || user?.email}</p>
              <p className="text-[10px] text-muted-foreground truncate">{getRoleName(role)}</p>
            </div>
          </div>
        </div>
      )}
      {collapsed && (
        <div className="py-3 border-b border-border/20 flex justify-center">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-[12px] font-bold text-primary-foreground">
            {user?.full_name?.charAt(0) || user?.email?.charAt(0) || "U"}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 no-scrollbar">
        {filteredNav.map((section, si) => (
          <div key={si} className="mb-3">
            {!collapsed && (
              <p className="px-5 text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider mb-1.5">{section.section}</p>
            )}
            {collapsed && si > 0 && (
              <div className="mx-4 my-2 border-t border-border/20" />
            )}
            {section.items.map((item) => {
              const Icon = ICON_MAP[item.icon] || LayoutDashboard;
              const isActive = item.path === "/portal"
                ? location.pathname === "/portal"
                : location.pathname.startsWith(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    onNavigate?.();
                  }}
                  title={collapsed ? item.label : undefined}
                  className={`relative w-full flex items-center gap-3 ${collapsed ? "justify-center px-0" : "px-5"} py-2.5 text-[13px] font-medium transition-colors group ${
                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="portalNavIndicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-primary"
                    />
                  )}
                  <Icon className={`w-[18px] h-[18px] flex-shrink-0 transition-transform ${collapsed ? "group-hover:scale-110" : ""}`} strokeWidth={isActive ? 2.4 : 2} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-border/20 p-3 space-y-1">
        <Link
          to="/"
          className={`flex items-center gap-3 ${collapsed ? "justify-center" : "px-3"} py-2.5 rounded-[14px] text-[12px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors`}
          title={collapsed ? "Back to Student App" : undefined}
        >
          <ChevronLeft className="w-[18px] h-[18px] flex-shrink-0" />
          {!collapsed && <span>Back to Student App</span>}
        </Link>
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 ${collapsed ? "justify-center" : "px-3"} py-2.5 rounded-[14px] text-[12px] font-medium text-muted-foreground hover:text-error hover:bg-error/5 transition-colors`}
          title={collapsed ? "Sign Out" : undefined}
        >
          <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );
}