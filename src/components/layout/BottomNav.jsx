import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Home as HomeIcon, Compass, Users, User as UserIcon } from "lucide-react";

/**
 * BottomNav — exactly four tabs. Only Home is functional in Milestone 2;
 * Quad, Connect, and Me exist as placeholders until future milestones.
 */
const TABS = [
  { key: "home", label: "Home", icon: HomeIcon, path: "/home" },
  { key: "quad", label: "Quad", icon: Compass, path: "/quad" },
  { key: "connect", label: "Connect", icon: Users, path: "/connect" },
  { key: "me", label: "Me", icon: UserIcon, path: "/me" },
];

export default function BottomNav() {
  const { pathname } = useLocation();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 pointer-events-none">
      <div className="max-w-[520px] mx-auto px-4 pb-4 safe-area-pb pointer-events-auto">
        <div className="glass-strong rounded-[24px] h-[64px] flex items-center justify-around px-2">
          {TABS.map((t) => {
            const active = pathname === t.path;
            return (
              <NavLink
                key={t.key}
                to={t.path}
                className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full spring-tap"
              >
                <t.icon
                  className={`w-[22px] h-[22px] transition-colors ${active ? "text-primary" : "text-muted-foreground"}`}
                  strokeWidth={active ? 2.4 : 2}
                />
                <span
                  className={`text-[10px] font-semibold transition-colors ${active ? "text-primary" : "text-muted-foreground"}`}
                >
                  {t.label}
                </span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
}