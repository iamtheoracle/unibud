import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Users, GraduationCap, User } from "lucide-react";
import { hapticSelect } from "@/lib/haptics";

const TABS = [
  { to: "/bud", label: "Bud", icon: Sparkles },
  { to: "/social", label: "Social", icon: Users },
  { to: "/academics", label: "Academics", icon: GraduationCap },
  { to: "/me", label: "Me", icon: User },
];

const SPRING = { type: "spring", stiffness: 420, damping: 32, mass: 0.9 };

/**
 * MainTabBar — the single, unified bottom navigation for UNIBUD OS.
 *
 * Four primary spaces: Bud · Social · Academics · Me.
 * Liquid Glass styling, Apple HIG safe-area handling, spring animations.
 * Rendered once in AppShell — never duplicated.
 */
export default function MainTabBar() {
  const location = useLocation();

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center pointer-events-none"
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
    >
      <motion.nav
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 30, mass: 0.9 }}
        className="liquid-mirror pointer-events-auto flex items-center gap-0.5 mx-3 px-1.5 h-[58px] rounded-[26px] max-w-[380px] w-full"
        aria-label="Primary navigation"
      >
        {TABS.map((tab) => {
          const isActive = location.pathname.startsWith(tab.to);
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              onClick={() => { if (!isActive) hapticSelect(); }}
              aria-current={isActive ? "page" : undefined}
              className="relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full rounded-[20px] spring-tap"
            >
              {isActive && (
                <motion.div
                  layoutId="tab-active-pill"
                  transition={SPRING}
                  className="absolute inset-0 rounded-[20px] bg-primary/12"
                />
              )}
              <div className="relative z-10 flex flex-col items-center gap-0.5">
                <motion.div
                  animate={{ scale: isActive ? 1.08 : 1, y: isActive ? -1 : 0 }}
                  transition={SPRING}
                >
                  <Icon
                    className={`w-[21px] h-[21px] transition-colors duration-300 ${isActive ? "text-primary" : "text-muted-foreground"}`}
                    strokeWidth={isActive ? 2.4 : 2}
                  />
                </motion.div>
                <span
                  className={`text-[10px] font-bold tracking-tight transition-colors duration-300 ${isActive ? "text-primary" : "text-muted-foreground"}`}
                >
                  {tab.label}
                </span>
              </div>
            </NavLink>
          );
        })}
      </motion.nav>
    </div>
  );
}