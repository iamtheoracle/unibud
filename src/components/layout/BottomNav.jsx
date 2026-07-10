import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Compass, MessageCircle, User, Video, Library, Clapperboard } from "lucide-react";
import { useFeatureFlags } from "@/lib/FeatureFlagContext";
import { useBudPanel } from "@/lib/BudPanelContext";
import { hapticTap } from "@/lib/haptics";
import UnibudMark from "@/components/brand/UnibudMark";

const allNavItems = [
  { path: "/", icon: Home, label: "Campus", flag: "campus" },
  { path: "/quad", icon: Compass, label: "Quad", flag: "quad" },
  { path: "/shorts", icon: Clapperboard, label: "Shorts", flag: null },
  { path: "/messages", icon: MessageCircle, label: "Messages", flag: null },
  { path: "/bud", icon: null, label: "Bud", flag: "bud", isCenter: true },
  { path: "/live", icon: Video, label: "Live", flag: "live" },
  { path: "/library", icon: Library, label: "Library", flag: "library" },
  { path: "/me", icon: User, label: "Me", flag: null },
];

export default function BottomNav() {
  const location = useLocation();
  const { isModuleEnabled } = useFeatureFlags();
  const { openBud } = useBudPanel();

  const navItems = allNavItems.filter((item) => !item.flag || isModuleEnabled(item.flag));

  // Split items around the center Bud button
  const centerIndex = navItems.findIndex((item) => item.isCenter);
  const leftItems = centerIndex >= 0 ? navItems.slice(0, centerIndex) : navItems.slice(0, Math.ceil(navItems.length / 2));
  const rightItems = centerIndex >= 0 ? navItems.slice(centerIndex + 1) : navItems.slice(Math.ceil(navItems.length / 2));
  const centerItem = centerIndex >= 0 ? navItems[centerIndex] : null;

  const isItemActive = (item) =>
    item.path === "/" ? location.pathname === "/" : location.pathname.startsWith(item.path);

  const renderNavTab = (item) => {
    const isActive = isItemActive(item);
    const Icon = item.icon;

    return (
      <Link
        key={item.path}
        to={item.path}
        onClick={() => hapticTap()}
        className="relative flex items-center justify-center w-12 h-12 spring-tap"
        aria-label={item.label}
      >
        {isActive && (
          <motion.div
            layoutId="navActivePill"
            className="absolute inset-0 rounded-full bg-primary/12"
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
          />
        )}
        <motion.div
          animate={{
            scale: isActive ? 1.08 : 1,
          }}
          transition={{ type: "spring", stiffness: 400, damping: 22 }}
          className="relative flex flex-col items-center"
        >
          <Icon
            className={`w-[21px] h-[21px] transition-colors duration-200 ${
              isActive ? "text-primary" : "text-muted-foreground/70"
            }`}
            strokeWidth={isActive ? 2.4 : 1.9}
          />
          <span
            className={`text-[8.5px] font-semibold mt-0.5 transition-colors duration-200 ${
              isActive ? "text-primary" : "text-muted-foreground/60"
            }`}
          >
            {item.label}
          </span>
        </motion.div>
      </Link>
    );
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 pointer-events-none">
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        className="max-w-lg mx-auto px-4 pb-[max(0.6rem,env(safe-area-inset-bottom))]"
      >
        <nav
          className="pointer-events-auto relative flex items-center justify-between gap-0.5 rounded-[28px] px-3 py-2"
          style={{
            background: "var(--glass-bg)",
            backdropFilter: "blur(var(--glass-blur)) saturate(1.4)",
            WebkitBackdropFilter: "blur(var(--glass-blur)) saturate(1.4)",
            border: "1px solid var(--glass-border)",
            boxShadow: "var(--shadow-elevated), 0 24px 60px rgba(0,0,0,0.07)",
          }}
        >
          {/* Left tabs */}
          {leftItems.map(renderNavTab)}

          {/* Center — Bud floating button */}
          {centerItem && (
            <button
              onClick={() => { hapticTap(); openBud(); }}
              className="relative flex items-center justify-center w-14 h-14 spring-tap"
              aria-label={centerItem.label}
            >
              <motion.div
                animate={{ scale: isItemActive(centerItem) ? 1.05 : 1 }}
                transition={{ type: "spring", stiffness: 380, damping: 20 }}
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{
                  background: "hsl(var(--primary))",
                  boxShadow: "0 4px 18px hsl(var(--primary) / 0.32), 0 2px 6px rgba(0,0,0,0.08)",
                }}
              >
                <UnibudMark className="w-6 h-6 text-primary-foreground" />
              </motion.div>
            </button>
          )}

          {/* Right tabs */}
          {rightItems.map(renderNavTab)}
        </nav>
      </motion.div>
    </div>
  );
}