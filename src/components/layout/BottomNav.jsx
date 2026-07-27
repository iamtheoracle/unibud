import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { GraduationCap, MessageSquareText, Users, User } from "lucide-react";
import { hapticSelect } from "@/lib/haptics";

/**
 * BottomNav — floating crystal dock.
 * Frosted glass with depth, a spring-morphing active indicator,
 * and a breathing active dot. Four tabs only (Campus, Quad, Connect, Me).
 */
const TABS = [
  { key: "campus", label: "Campus", paths: ["/home", "/campus"], icon: GraduationCap },
  { key: "quad", label: "Quad", paths: ["/quad"], icon: MessageSquareText },
  { key: "connect", label: "Connect", paths: ["/connect"], icon: Users },
  { key: "me", label: "Me", paths: ["/me"], icon: User },
];

export default function BottomNav() {
  const { pathname } = useLocation();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 pointer-events-none">
      <div className="max-w-[520px] mx-auto px-5 pb-5 safe-area-pb pointer-events-auto">
        <div className="founder-dock rounded-[28px] h-[64px] flex items-center justify-around px-2 relative edge-light">
          {TABS.map((t) => {
            const active = t.paths.some((p) => pathname === p || pathname.startsWith(p + "/"));
            return (
              <NavLink
                key={t.key}
                to={t.paths[0]}
                onClick={() => hapticSelect()}
                className="relative flex flex-col items-center justify-center flex-1 h-full spring-tap"
              >
                {active && (
                  <motion.div
                    layoutId="dock-active-pill"
                    className="absolute inset-1.5 rounded-[20px] dock-pill"
                    style={{ boxShadow: "0 2px 12px rgba(37,99,235,0.10), inset 0 1px 0 rgba(255,255,255,0.08)" }}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <motion.div
                  animate={{ scale: active ? 1.06 : 1, y: active ? -1 : 0 }}
                  transition={{ type: "spring", stiffness: 320, damping: 18 }}
                  className="relative flex flex-col items-center"
                >
                  <t.icon
                    className={`w-[20px] h-[20px] mb-0.5 transition-colors duration-200 ${active ? "dock-icon-active" : "dock-icon"}`}
                    strokeWidth={active ? 2.3 : 1.9}
                  />
                  <span className={`text-[10px] font-semibold transition-colors duration-200 ${active ? "dock-label-active" : "dock-label"}`}>
                    {t.label}
                  </span>
                  {active && (
                    <motion.div
                      className="absolute -bottom-1.5 w-1 h-1 rounded-full dock-dot"
                      animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.4, 1] }}
                      transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                    />
                  )}
                </motion.div>
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
}