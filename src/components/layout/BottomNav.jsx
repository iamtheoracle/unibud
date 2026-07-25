import React from "react";
import { NavLink, useLocation } from "react-router-dom";

/**
 * BottomNav — four text tabs. Only Home is functional in Milestone 2;
 * Quad, Connect, and Me exist as placeholders.
 */
const TABS = [
  { key: "home", label: "Home", path: "/home" },
  { key: "quad", label: "Quad", path: "/quad" },
  { key: "connect", label: "Connect", path: "/connect" },
  { key: "me", label: "Me", path: "/me" },
];

export default function BottomNav() {
  const { pathname } = useLocation();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 pointer-events-none">
      <div className="max-w-[520px] mx-auto px-4 pb-4 safe-area-pb pointer-events-auto">
        <div className="glass-strong rounded-[24px] h-[60px] flex items-center justify-around px-2">
          {TABS.map((t) => {
            const active = pathname === t.path;
            return (
              <NavLink
                key={t.key}
                to={t.path}
                className="flex flex-col items-center justify-center flex-1 h-full spring-tap"
              >
                <span className={`text-[12px] font-semibold transition-colors ${active ? "text-primary" : "text-muted-foreground"}`}>
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