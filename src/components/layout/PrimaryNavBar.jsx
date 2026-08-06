/**
 * UNIBUD Navigation OS — Primary Navigation Bar
 *
 * The single, canonical bottom navigation for the entire student app.
 * Four visible tabs: Square · Quad · Connect · Me
 *
 * Bud is NOT a tab. Bud is accessible through:
 *   • Me → Bud Home (/home)
 *   • Command Bar (Cmd+K / long-press)
 *   • Voice
 *   • Quick Actions
 *
 * Design:
 *   • Dark glass bar, rounded, floating
 *   • White active icons, orange underline + glow
 *   • Inactive tabs are dimmed
 *   • Animated active indicator using framer-motion layoutId
 *   • Safe-area insets for iOS notch/home bar
 *   • Touch targets ≥ 44px (WCAG 2.5.5)
 *   • aria-current="page" on active tab
 *   • Haptic feedback on tab switch
 */

import React, { useMemo } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid,
  GraduationCap,
  MessageCircle,
  User,
} from "lucide-react";
import { hapticSelect } from "@/lib/haptics";
import { useMotion } from "@/lib/motion/useMotion";
import { useNavigation } from "@/lib/os/NavigationContext";
import { validateNavigation } from "@/lib/os/constitutionalValidator";
import { PRIMARY_DESTINATIONS } from "@/lib/navigation/registry";
import { useNavigationAnalytics } from "@/lib/navigation/navigationAnalytics";

const ICON_MAP = {
  LayoutGrid,
  GraduationCap,
  MessageCircle,
  User,
};

function resolveIcon(iconName) {
  return ICON_MAP[iconName] || LayoutGrid;
}

/**
 * PrimaryNavBar — the single authoritative bottom navigation.
 * Replaces MainTabBar, AdaptiveNav, and GlobalNavDock.
 */
export default function PrimaryNavBar() {
  const location = useLocation();
  const motionEngine = useMotion();
  const { tabs } = useNavigation();
  const { recordTabVisit } = useNavigationAnalytics();

  const SPRING = motionEngine.spring("navigation");

  const navItems = useMemo(() => {
    const items = PRIMARY_DESTINATIONS.map((dest) => ({
      id: dest.id,
      to: dest.to,
      label: dest.label,
      icon: resolveIcon(dest.icon),
    }));

    if (import.meta.env?.DEV) {
      const validation = validateNavigation(items);
      if (!validation.valid) {
        console.warn("[Constitutional Validator] Navigation violations:", validation.errors);
      }
    }

    return items;
  }, []);

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center pointer-events-none"
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
    >
      <motion.nav
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={SPRING}
        className="pointer-events-auto relative flex items-center mx-2 px-1 h-[56px] rounded-[26px] max-w-[440px] w-full overflow-hidden"
        style={{
          background: "rgba(11, 11, 11, 0.84)",
          backdropFilter: "blur(20px) saturate(1.5)",
          WebkitBackdropFilter: "blur(20px) saturate(1.5)",
          border: "1px solid rgba(255, 255, 255, 0.06)",
          boxShadow:
            "0 6px 20px rgba(0,0,0,0.32), 0 20px 60px rgba(0,0,0,0.44), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
        aria-label="Primary navigation"
        role="navigation"
      >
        {navItems.map((tab) => {
          const isActive =
            location.pathname === tab.to ||
            location.pathname.startsWith(tab.to + "/");
          const Icon = tab.icon;

          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              onClick={() => {
                if (!isActive) {
                  hapticSelect();
                  recordTabVisit(tab.id);
                }
              }}
              aria-current={isActive ? "page" : undefined}
              aria-label={tab.label}
              className="relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full rounded-[20px] spring-tap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:ring-offset-black"
              style={{ minHeight: "44px", minWidth: "44px" }}
            >
              {/* Orange underline for active tab */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    layoutId="primary-nav-underline"
                    className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-[2.5px] rounded-full"
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    exit={{ opacity: 0, scaleX: 0 }}
                    style={{
                      background: "hsl(var(--primary))",
                      boxShadow: "0 0 10px hsl(var(--primary) / 0.7)",
                    }}
                  />
                )}
              </AnimatePresence>

              {/* Subtle active glow */}
              {isActive && (
                <div
                  className="absolute inset-0 rounded-[20px] pointer-events-none"
                  style={{ boxShadow: "inset 0 0 18px hsl(var(--primary) / 0.09)" }}
                />
              )}

              {/* Icon + label */}
              <div className="relative z-10 flex flex-col items-center gap-[3px]">
                <Icon
                  className="w-[19px] h-[19px]"
                  strokeWidth={isActive ? 2.4 : 2}
                  style={{
                    color: isActive
                      ? "rgb(255, 255, 255)"
                      : "rgba(255, 255, 255, 0.38)",
                    transition: "color 0.2s ease",
                  }}
                />
                <span
                  className="text-[9.5px] font-bold tracking-tight"
                  style={{
                    color: isActive
                      ? "rgb(255, 255, 255)"
                      : "rgba(255, 255, 255, 0.38)",
                    transition: "color 0.2s ease",
                  }}
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
