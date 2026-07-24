import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Sparkles, BookOpen, User } from "lucide-react";
import { useFeatureFlags } from "@/lib/FeatureFlagContext";
import { hapticTap } from "@/lib/haptics";

const allNavItems = [
  { path: "/", icon: Home, label: "Home", flag: "campus" },
  { path: "/bud", icon: Sparkles, label: "Bud", flag: "bud" },
  { path: "/academics", icon: BookOpen, label: "Courses", flag: null },
  { path: "/me", icon: User, label: "Me", flag: null },
];

export default function BottomNav() {
  const location = useLocation();
  const { isModuleEnabled } = useFeatureFlags();

  const navItems = allNavItems.filter((item) => !item.flag || isModuleEnabled(item.flag));

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
        className="relative flex items-center justify-center w-14 h-12 spring-tap hover:bg-muted/40 rounded-full transition-colors duration-200 lg:w-16 lg:h-14"
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
            className={`text-[9px] font-semibold mt-0.5 transition-colors duration-200 ${
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
    <div className="fixed inset-x-0 bottom-0 z-40 pointer-events-none safe-area-px">
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        className="max-w-lg mx-auto px-4 sm:px-5 safe-area-pb lg:max-w-2xl"
      >
        <nav
          className="pointer-events-auto relative flex items-center justify-between gap-1 rounded-[28px] px-4 py-2"
          style={{
            background: "var(--glass-bg)",
            backdropFilter: "blur(var(--glass-blur)) saturate(1.4)",
            WebkitBackdropFilter: "blur(var(--glass-blur)) saturate(1.4)",
            border: "1px solid var(--glass-border)",
            boxShadow: "var(--shadow-elevated), 0 24px 60px rgba(0,0,0,0.07)",
          }}
        >
          {navItems.map(renderNavTab)}
        </nav>
      </motion.div>
    </div>
  );
}