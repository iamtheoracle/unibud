import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Activity, ScrollText, Boxes, Users, ShieldCheck, Landmark,
  LineChart, BarChart3, LifeBuoy, FileEdit, Bot, Settings, Wrench,
  LogOut, X, ChevronLeft, Building, Layers, GraduationCap,
  BookOpen, CalendarDays, Megaphone, CheckSquare, PlayCircle, UsersRound,
  Video, ClipboardList, FolderOpen, IdCard, Mail, Flag, Building2,
  Crown, Brain, Network, ClipboardCheck, UserPlus, ShoppingBag,
} from "lucide-react";
import UnibudMark from "@/components/brand/UnibudMark";
import { getPortalNavigation, getRoleName, normalizeRole } from "@/lib/portalConfig";
import { base44 } from "@/api/base44Client";

const ICON_MAP = {
  LayoutDashboard, Activity, ScrollText, Boxes, Users, ShieldCheck, Landmark,
  LineChart, BarChart3, LifeBuoy, FileEdit, Bot, Settings, Wrench,
  Building, Layers, GraduationCap, BookOpen, CalendarDays, Megaphone,
  CheckSquare, PlayCircle, UsersRound, Video, ClipboardList, FolderOpen,
  IdCard, Mail, Flag, Building2,
  Crown, Brain, Network, ClipboardCheck, UserPlus, ShoppingBag,
};

export default function PortalSidebar({ user, onNavigate }) {
  const location = useLocation();
  const navigate = useNavigate();
  const role = normalizeRole(user?.role);
  const nav = getPortalNavigation(role);

  const handleLogout = async () => {
    await base44.auth.logout("/login");
  };

  return (
    <div className="flex flex-col h-full bg-black text-white">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-n7">
        <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center gold-glow flex-shrink-0">
          <UnibudMark className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="font-heading font-extrabold text-[15px] tracking-tight leading-none">UNIBUD</p>
          <p className="text-[10px] text-n3 font-medium mt-1">Operations Portal</p>
        </div>
        {onNavigate && (
          <button onClick={onNavigate} className="ml-auto lg:hidden text-n3 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Role badge */}
      <div className="px-5 py-3 border-b border-n7">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-n7 flex items-center justify-center text-[12px] font-bold text-white">
            {user?.full_name?.charAt(0) || user?.email?.charAt(0) || "U"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-semibold text-white truncate">{user?.full_name || user?.email}</p>
            <p className="text-[10px] text-n3 truncate">{getRoleName(role)}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 no-scrollbar">
        {nav.map((section, si) => (
          <div key={si} className="mb-4">
            <p className="px-5 text-[10px] font-semibold text-n4 uppercase tracking-wider mb-1.5">{section.section}</p>
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
                  className={`relative w-full flex items-center gap-3 px-5 py-2.5 text-[13px] font-medium transition-colors ${
                    isActive ? "text-primary" : "text-n3 hover:text-white hover:bg-n7/50"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="portalNavIndicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary"
                    />
                  )}
                  <Icon className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={isActive ? 2.4 : 2} />
                  {item.label}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Student app link + Logout */}
      <div className="border-t border-n7 p-3 space-y-1">
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[12px] font-medium text-n3 hover:text-white hover:bg-n7/50 transition-colors"
        >
          <ChevronLeft className="w-[18px] h-[18px]" />
          Back to Student App
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[12px] font-medium text-n3 hover:text-error hover:bg-error/5 transition-colors"
        >
          <LogOut className="w-[18px] h-[18px]" />
          Sign Out
        </button>
      </div>
    </div>
  );
}