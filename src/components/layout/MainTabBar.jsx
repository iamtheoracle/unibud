import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Users, GraduationCap, User } from "lucide-react";

const TABS = [
  { to: "/bud", label: "Bud", icon: Sparkles },
  { to: "/social", label: "Social", icon: Users },
  { to: "/academics", label: "Academics", icon: GraduationCap },
  { to: "/me", label: "Me", icon: User },
];

export default function MainTabBar() {
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center pb-[env(safe-area-inset-bottom)]">
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="flex items-center gap-1 mx-4 mb-3 px-2 h-14 rounded-[22px] bg-card shadow-md"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.08), 0 16px 48px rgba(0,0,0,0.06)" }}
      >
        {TABS.map((tab) => {
          const isActive = location.pathname.startsWith(tab.to);
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className="relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full rounded-[18px]"
            >
              {isActive && (
                <motion.div
                  layoutId="tab-active"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className="absolute inset-0 rounded-[18px] bg-primary/10"
                />
              )}
              <div className="relative z-10 flex flex-col items-center gap-0.5">
                <Icon
                  className={`w-5 h-5 transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`}
                  strokeWidth={2.2}
                />
                <span className={`text-[9px] font-bold transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                  {tab.label}
                </span>
              </div>
            </NavLink>
          );
        })}
      </motion.div>
    </div>
  );
}