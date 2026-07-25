import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Users, Link2, User } from "lucide-react";
import { hapticTap } from "@/lib/haptics";
import CommandOrb from "@/components/layout/CommandOrb";

/**
 * V12 Floating Command Dock — 4 OS-style tabs (Campus, Quad, Connect, Me)
 * with the Liquid Glass Command Orb at the center.
 */
const tabs = [
  { path: "/", icon: Home, label: "Campus" },
  { path: "/quad", icon: Users, label: "Quad" },
  { path: "/connect", icon: Link2, label: "Connect" },
  { path: "/me", icon: User, label: "Me" },
];

export default function BottomNav() {
  const location = useLocation();
  const isActive = (p) =>
    p === "/" ? location.pathname === "/" : location.pathname.startsWith(p);

  const renderTab = (item) => {
    const active = isActive(item.path);
    const Icon = item.icon;
    return (
      <Link
        key={item.path}
        to={item.path}
        onClick={() => hapticTap()}
        className="relative flex items-center justify-center w-14 h-12 spring-tap hover:bg-muted/40 rounded-full"
        aria-label={item.label}
      >
        {active && (
          <motion.div
            layoutId="navActivePill"
            className="absolute inset-0 rounded-full bg-primary/12"
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
          />
        )}
        <motion.div
          animate={{ scale: active ? 1.08 : 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 22 }}
          className="relative flex flex-col items-center"
        >
          <Icon
            className={`w-[21px] h-[21px] transition-colors ${active ? "text-primary" : "text-muted-foreground/70"}`}
            strokeWidth={active ? 2.4 : 1.9}
          />
          <span
            className={`text-[9px] font-semibold mt-0.5 transition-colors ${active ? "text-primary" : "text-muted-foreground/60"}`}
          >
            {item.label}
          </span>
        </motion.div>
      </Link>
    );
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 pointer-events-none safe-area-px">
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        className="max-w-lg mx-auto px-4 sm:px-5 safe-area-pb lg:max-w-xl"
      >
        <nav
          className="pointer-events-auto relative flex items-center justify-between gap-1 rounded-[28px] px-3 py-2"
          style={{
            background: "var(--glass-bg)",
            backdropFilter: "blur(var(--glass-blur)) saturate(1.5)",
            WebkitBackdropFilter: "blur(var(--glass-blur)) saturate(1.5)",
            border: "1px solid var(--glass-border)",
            boxShadow: "var(--shadow-elevated)",
          }}
        >
          {tabs.slice(0, 2).map(renderTab)}
          <CommandOrb />
          {tabs.slice(2).map(renderTab)}
        </nav>
      </motion.div>
    </div>
  );
}