import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Home, MessagesSquare, GraduationCap, Store, CalendarDays,
  Users, Bookmark, User, Settings, Sparkles, LayoutGrid, Radio,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Home", icon: Home, path: "/home" },
  { label: "Orbit", icon: Radio, path: "/social" },
  { label: "Academic", icon: GraduationCap, path: "/academics" },
  { label: "Messages", icon: MessagesSquare, path: "/messages" },
  { label: "Marketplace", icon: Store, path: "/marketplace" },
  { label: "Events", icon: CalendarDays, path: "/events" },
  { label: "Communities", icon: Users, path: "/communities" },
  { label: "Highlights", icon: Bookmark, path: "/highlights" },
  { label: "Games", icon: LayoutGrid, path: "/games" },
];

const BOTTOM_ITEMS = [
  { label: "Profile", icon: User, path: "/me" },
  { label: "Settings", icon: Settings, path: "/settings" },
];

/**
 * DesktopSidebar — left navigation rail for desktop mode.
 * Collapsible with icon-only and expanded states.
 */
export default function DesktopSidebar({ onOpenWindow }) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      animate={{ width: collapsed ? 60 : 200 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col h-full border-r border-border/30 bg-background/40 backdrop-blur-xl"
    >
      {/* Brand */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center gap-2.5 h-14 px-4 border-b border-border/20 flex-shrink-0 spring-tap"
      >
        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
        </div>
        {!collapsed && <span className="font-heading font-bold text-[14px] text-foreground">UNIBUD</span>}
      </button>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 no-scrollbar">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path}>
              <motion.div
                whileHover={{ x: collapsed ? 0 : 2 }}
                className={cn(
                  "flex items-center gap-2.5 h-9 mx-2 rounded-[10px] spring-tap relative group",
                  active ? "glass text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {active && (
                  <motion.div
                    layoutId="desktop-nav-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-primary rounded-r-full"
                  />
                )}
                <Icon className="w-4 h-4 flex-shrink-0 mx-auto" strokeWidth={2.2} style={{ marginLeft: collapsed ? "auto" : undefined, marginRight: collapsed ? "auto" : undefined }} />
                {!collapsed && <span className="text-[12px] font-medium">{item.label}</span>}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Bud dock button */}
      <button
        onClick={() => onOpenWindow?.("bud", "Bud")}
        className="flex items-center gap-2.5 h-10 mx-2 rounded-[10px] glass spring-tap"
      >
        <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mx-auto">
          <Sparkles className="w-4 h-4 text-primary" strokeWidth={2.2} />
        </div>
        {!collapsed && <span className="text-[12px] font-bold text-foreground">Bud</span>}
      </button>

      {/* Bottom items */}
      <div className="py-2 border-t border-border/20">
        {BOTTOM_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path}>
              <div className={cn(
                "flex items-center gap-2.5 h-9 mx-2 rounded-[10px] spring-tap",
                active ? "glass text-foreground" : "text-muted-foreground hover:text-foreground"
              )}>
                <Icon className="w-4 h-4 flex-shrink-0 mx-auto" strokeWidth={2.2} />
                {!collapsed && <span className="text-[12px] font-medium">{item.label}</span>}
              </div>
            </Link>
          );
        })}
      </div>
    </motion.aside>
  );
}