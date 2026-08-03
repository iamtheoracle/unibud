import React, { useMemo } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutGrid, GraduationCap, Compass, MessageCircle,
  Search, Grid3x3, User,
} from "lucide-react";
import { hapticSelect } from "@/lib/haptics";
import { useMotion } from "@/lib/motion/useMotion";
import { EXPERIENCES } from "@/lib/os/manifest";
import { validateNavigation } from "@/lib/os/constitutionalValidator";

// Icon string → lucide component mapping (manifest stores icon names as strings)
const ICON_MAP = {
  LayoutGrid, GraduationCap, Compass, MessageCircle,
  Search, Grid3x3, User,
};

/**
 * MainTabBar — the single, unified bottom navigation for UNIBUD OS v4.
 *
 * Entirely registry-driven: consumes the five permanent experiences from
 * the Platform Manifest. No hard-coded navigation logic.
 *
 * Bud is omnipresent (FloatingBudButton) and never appears as a tab.
 * Marketplace, Wallet, and all hidden services are reachable only through
 * Services, Lens, Bud, or contextual workflows — never as permanent tabs.
 *
 * References: OS Constitution, Experience Registry, Constitutional Validator.
 */
export default function MainTabBar() {
  const location = useLocation();
  const motionEngine = useMotion();
  const SPRING = motionEngine.spring('navigation');

  // Dev-time constitutional validation — ensures no hidden service leaks into nav
  const navItems = useMemo(() => {
    const items = EXPERIENCES.map((exp) => ({
      id: exp.id,
      to: exp.to,
      label: exp.label,
      icon: ICON_MAP[exp.icon] || LayoutGrid,
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
        className="liquid-mirror pointer-events-auto flex items-center gap-0 mx-2 px-1 h-[54px] rounded-[24px] max-w-[440px] w-full"
        aria-label="Primary navigation"
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
              {isActive && (
                <motion.div
                  layoutId="tab-active-pill"
                  transition={SPRING}
                  className="absolute inset-0 rounded-[18px] bg-primary/12"
                />
              )}
              <div className="relative z-10 flex flex-col items-center gap-0.5">
                <motion.div
                  animate={{ scale: isActive ? 1.1 : 1, y: isActive ? -1 : 0 }}
                  transition={SPRING}
                >
                  <Icon
                    className={`w-[18px] h-[18px] transition-colors duration-300 ${isActive ? "text-primary" : "text-muted-foreground"}`}
                    strokeWidth={isActive ? 2.4 : 2}
                  />
                </motion.div>
                <span
                  className={`text-[9px] font-bold tracking-tight transition-colors duration-300 ${isActive ? "text-primary" : "text-muted-foreground"}`}
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