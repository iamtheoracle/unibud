import React, { useMemo } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid, GraduationCap, Compass, MessageCircle,
  Grid3x3, User,
} from "lucide-react";
import { hapticSelect } from "@/lib/haptics";
import { useMotion } from "@/lib/motion/useMotion";
import { useNavigation } from "@/lib/os/NavigationContext";
import { validateNavigation } from "@/lib/os/constitutionalValidator";

const ICON_MAP = {
  LayoutGrid, GraduationCap, Compass, MessageCircle, Grid3x3, User,
};

/**
 * MainTabBar — the context-aware bottom navigation for UNIBUD OS.
 *
 * Renders different tabs based on the active world:
 *   Social:    Square · Discover · Connect · Me
 *   Academics: Campus · Quad · Connect · Me
 *
 * Me is permanently fixed (bottom-right in both worlds).
 * Connect exists in both worlds — its content adapts.
 * Bud is omnipresent (FloatingBudButton) and never appears as a tab.
 *
 * Visual: dark glass bar with white active icons, orange glow + underline.
 * Inactive tabs are gray with no fill. Rounded, floating, minimal blur.
 */
export default function MainTabBar() {
  const location = useLocation();
  const motionEngine = useMotion();
  const { tabs, worldId } = useNavigation();
  const SPRING = motionEngine.spring('navigation');

  const navItems = useMemo(() => {
    const items = tabs.map((tab) => ({
      id: tab.id,
      to: tab.to,
      label: tab.label,
      icon: ICON_MAP[tab.icon] || LayoutGrid,
    }));

    if (import.meta.env?.DEV) {
      const validation = validateNavigation(items);
      if (!validation.valid) {
        console.warn("[Constitutional Validator] Navigation violations:", validation.errors);
      }
    }

    return items;
  }, [tabs]);

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center pointer-events-none"
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
    >
      <motion.nav
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={SPRING}
        className="pointer-events-auto relative flex items-center mx-2 px-1 h-[54px] rounded-[24px] max-w-[440px] w-full overflow-hidden"
        style={{
          background: "rgba(11, 11, 11, 0.82)",
          backdropFilter: "blur(20px) saturate(1.5)",
          WebkitBackdropFilter: "blur(20px) saturate(1.5)",
          border: "1px solid rgba(255, 255, 255, 0.06)",
          boxShadow: "0 6px 20px rgba(0,0,0,0.30), 0 20px 60px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
        aria-label="Primary navigation"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={worldId}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex items-center w-full h-full"
          >
            {navItems.map((tab) => {
              const isActive = location.pathname === tab.to || location.pathname.startsWith(tab.to + "/");
              const Icon = tab.icon;
              return (
                <NavLink
                  key={tab.to}
                  to={tab.to}
                  onClick={() => { if (!isActive) hapticSelect(); }}
                  aria-current={isActive ? "page" : undefined}
                  className="relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full rounded-[18px] spring-tap"
                >
                  {/* Orange underline for active tab */}
                  {isActive && (
                    <motion.div
                      layoutId={`tab-underline-${worldId}`}
                      className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-[2px] rounded-full"
                      style={{
                        background: "hsl(var(--primary))",
                        boxShadow: "0 0 8px hsl(var(--primary) / 0.6)",
                      }}
                    />
                  )}
                  {/* Subtle orange glow for active */}
                  {isActive && (
                    <div
                      className="absolute inset-0 rounded-[18px] pointer-events-none"
                      style={{ boxShadow: "inset 0 0 16px hsl(var(--primary) / 0.08)" }}
                    />
                  )}
                  <div className="relative z-10 flex flex-col items-center gap-0.5">
                    <Icon
                      className="w-[18px] h-[18px]"
                      strokeWidth={isActive ? 2.4 : 2}
                      style={{ color: isActive ? "rgb(255, 255, 255)" : "rgba(255, 255, 255, 0.40)" }}
                    />
                    <span
                      className="text-[9px] font-bold tracking-tight"
                      style={{ color: isActive ? "rgb(255, 255, 255)" : "rgba(255, 255, 255, 0.40)" }}
                    >
                      {tab.label}
                    </span>
                  </div>
                </NavLink>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </motion.nav>
    </div>
  );
}