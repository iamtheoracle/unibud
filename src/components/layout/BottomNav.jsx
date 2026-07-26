import React from "react";
import { NavLink, useLocation } from "react-router-dom";

/**
 * BottomNav — primary navigation. Per the UNIBUD Master Design Directive,
 * the primary navigation contains only: Campus, Quad, Connect, Me.
 * Every other workspace is reached from the Quick Workspace Dock (EcosystemRail).
 */
const TABS = [
  { key: "campus", label: "Campus", paths: ["/home", "/campus"] },
  { key: "quad", label: "Quad", paths: ["/quad"] },
  { key: "connect", label: "Connect", paths: ["/connect"] },
  { key: "me", label: "Me", paths: ["/me"] },
];

export default function BottomNav() {
  const { pathname } = useLocation();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 pointer-events-none">
      <div className="max-w-[520px] mx-auto px-4 pb-4 safe-area-pb pointer-events-auto">
        <div className="glass-strong rounded-[24px] h-[60px] flex items-center justify-around px-2">
          {TABS.map((t) => {
            const active = t.paths.some((p) => pathname === p || pathname.startsWith(p + "/"));
            return (
              <NavLink
                key={t.key}
                to={t.paths[0]}
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