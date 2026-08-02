import React, { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, MotionConfig } from "framer-motion";
import {
  Users as SocialIcon,
  BookOpen as AcademicIcon,
  User as MeIcon,
} from "lucide-react";
import { hapticTap } from "@/lib/haptics";
import { PRIMARY_NAV } from "@/lib/navigation/adaptiveNavConfig";

/* ── Warm palette ── */
const CREAM = "#F7F0E8";
const CREAM_MUTED = "rgba(247, 240, 232, 0.45)";

/* ── Spring physics ── */
const SPRING = { type: "spring", stiffness: 420, damping: 34, mass: 0.9 };
const EASE = [0.16, 1, 0.3, 1];
const DOCK_ENTER = { duration: 0.55, ease: EASE };

function isActive(pathname, to) {
  return pathname === to || pathname.startsWith(to + "/");
}

/**
 * AdaptiveNav — simplified primary navigation.
 *
 * Three destinations only: Social, Academic, Me.
 * Bud lives as the floating companion, not in the nav.
 */
export default function AdaptiveNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;

  const handleNav = useCallback((to) => {
    hapticTap();
    navigate(to);
  }, []);

  const socialActive = isActive(pathname, "/social") || isActive(pathname, "/square") || isActive(pathname, "/quad");
  const academicActive = isActive(pathname, "/academics") || isActive(pathname, "/academic");
  const meActive = isActive(pathname, "/me");

  const items = [
    { key: "social", label: "Social", to: "/social", icon: SocialIcon, active: socialActive },
    { key: "academic", label: "Academic", to: "/academics", icon: AcademicIcon, active: academicActive },
  ];

  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={DOCK_ENTER}
        className="fixed bottom-0 inset-x-0 z-40 pointer-events-none"
      >
        <div className="flex items-center justify-center gap-2.5 px-3 pb-3 safe-area-pb pointer-events-auto">
          {/* Single dock — Social + Academic + Me */}
          <div className="os-dock h-[52px] rounded-[28px] flex items-center p-1.5 gap-1">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  onClick={() => handleNav(item.to)}
                  aria-current={item.active ? "page" : undefined}
                  aria-label={item.label}
                  className="relative flex items-center justify-center h-[42px] px-6 spring-tap"
                >
                  {item.active && (
                    <motion.div
                      layoutId="nav-active-pill"
                      className="absolute inset-0 rounded-[22px] os-pill-active"
                      transition={SPRING}
                    />
                  )}
                  <div className="relative flex items-center gap-2">
                    <Icon
                      className="w-[18px] h-[18px] transition-colors duration-300"
                      style={{ color: item.active ? CREAM : CREAM_MUTED }}
                      strokeWidth={item.active ? 2.2 : 1.7}
                    />
                    <span
                      className="text-[13px] font-semibold tracking-tight transition-colors duration-300"
                      style={{ color: item.active ? CREAM : CREAM_MUTED }}
                    >
                      {item.label}
                    </span>
                  </div>
                </button>
              );
            })}

            {/* Me — circular profile button */}
            <button
              onClick={() => handleNav("/me")}
              aria-current={meActive ? "page" : undefined}
              aria-label="Me"
              className="os-me-capsule w-[42px] h-[42px] rounded-full flex items-center justify-center shrink-0 relative ml-1"
            >
              {meActive && (
                <motion.div
                  layoutId="nav-active-pill"
                  className="absolute inset-0 rounded-full os-pill-active"
                  transition={SPRING}
                />
              )}
              <div className="relative">
                <MeIcon
                  className="w-[20px] h-[20px] transition-colors duration-300"
                  style={{ color: meActive ? CREAM : CREAM_MUTED }}
                  strokeWidth={meActive ? 2.2 : 1.7}
                />
              </div>
            </button>
          </div>
        </div>
      </motion.div>
    </MotionConfig>
  );
}