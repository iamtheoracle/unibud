import React, { useState, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import {
  LayoutGrid as SquareIcon,
  Compass as DiscoverIcon,
  MessageSquare as ConnectIcon,
  GraduationCap as CampusIcon,
  Layers as QuadIcon,
  User as MeIcon,
  Users as SocialLensIcon,
  BookOpen as AcademicLensIcon,
} from "lucide-react";
import { hapticSelect, hapticImpact, hapticTap } from "@/lib/haptics";
import { useExperience } from "@/lib/ExperienceContext";

/* ── Spring physics — Apple-like: high stiffness, medium damping ── */
const SPRING = { type: "spring", stiffness: 400, damping: 30, mass: 0.9 };
const ICON_SPRING = { type: "spring", stiffness: 500, damping: 28, mass: 0.8 };
const EASE = [0.16, 1, 0.3, 1];
const DOCK_ENTER = { duration: 0.55, ease: EASE };
const LENS_AUTO_DISMISS_MS = 3500;
const SWIPE_THRESHOLD = 35;

/* ── Social mode tabs ── */
const SOCIAL_TABS = [
  { key: "square", label: "Square", to: "/square", icon: SquareIcon },
  { key: "discover", label: "Discover", to: "/discover", icon: DiscoverIcon },
  { key: "connect", label: "Connect", to: "/connect", icon: ConnectIcon },
];

/* ── Academic mode tabs ── */
const ACADEMIC_TABS = [
  { key: "campus", label: "Campus", to: "/campus", icon: CampusIcon },
  { key: "quad", label: "Quad", to: "/quad", icon: QuadIcon },
  { key: "connect", label: "Connect", to: "/connect", icon: ConnectIcon },
];

/* ── Lens selector options (temporary, swipe to reveal) ── */
const LENSES = [
  { key: "social", label: "Social", icon: SocialLensIcon },
  { key: "academic", label: "Academics", icon: AcademicLensIcon },
];

function isActive(pathname, to) {
  return pathname === to || pathname.startsWith(to + "/");
}

/**
 * AdaptiveNav — UNIBUD's signature floating navigation dock.
 *
 * Architecture:
 *   LEFT  → Adaptive Capsule (morphs between Social/Academic tab sets)
 *   RIGHT → Me Button (permanently fixed, never animates horizontally)
 *
 * Swipe the capsule → temporarily reveals a lens selector [Social | Academics].
 * Selecting a lens morphs the capsule back to the 3-tab set for that mode.
 *
 * The Me button NEVER changes position. Only the capsule morphs.
 */
export default function AdaptiveNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { mode, setMode } = useExperience();
  const pathname = location.pathname;

  // "tabs" = normal 3-tab capsule | "lens" = temporary lens selector
  const [navState, setNavState] = useState("tabs");
  const touchStartX = useRef(0);
  const lensTimerRef = useRef(null);

  const currentTabs = mode === "social" ? SOCIAL_TABS : ACADEMIC_TABS;

  /* ── Swipe → reveal lens selector ── */
  const enterLensMode = useCallback(() => {
    hapticImpact();
    setNavState("lens");
    if (lensTimerRef.current) clearTimeout(lensTimerRef.current);
    lensTimerRef.current = setTimeout(() => setNavState("tabs"), LENS_AUTO_DISMISS_MS);
  }, []);

  const exitLensMode = useCallback(() => {
    setNavState("tabs");
    if (lensTimerRef.current) clearTimeout(lensTimerRef.current);
  }, []);

  /* ── Select a lens → change mode, morph back to tabs ── */
  const selectLens = useCallback((lensMode) => {
    hapticSelect();
    setMode(lensMode);
    exitLensMode();
  }, [setMode, exitLensMode]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > SWIPE_THRESHOLD) {
      enterLensMode();
    }
  };

  const handleNav = (to) => {
    hapticTap();
    navigate(to);
  };

  return (
    <MotionConfig reducedMotion="user">
      <motion.nav
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={DOCK_ENTER}
        className="fixed bottom-0 inset-x-0 z-40 pointer-events-none"
        aria-label="Primary navigation"
      >
        <div className="max-w-[520px] mx-auto px-3 pb-3 safe-area-pb pointer-events-auto">
          <div className="luxury-dock rounded-[38px] h-[80px] flex items-stretch p-2 gap-2">
            {/* ═══ LEFT: Adaptive Capsule ═══ */}
            <div
              className="flex-1 flex items-center min-w-0 relative overflow-hidden rounded-[30px]"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <AnimatePresence mode="wait">
                {navState === "tabs" ? (
                  /* ── Tab capsule — 3 tabs for current mode ── */
                  <motion.div
                    key={`tabs-${mode}`}
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.94 }}
                    transition={{ duration: 0.28, ease: EASE }}
                    className="flex items-center w-full"
                  >
                    {currentTabs.map((tab) => (
                      <NavTab
                        key={tab.key}
                        tab={tab}
                        active={isActive(pathname, tab.to)}
                        onClick={() => handleNav(tab.to)}
                      />
                    ))}
                  </motion.div>
                ) : (
                  /* ── Lens selector — temporary Social/Academic switcher ── */
                  <motion.div
                    key="lens-selector"
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.94 }}
                    transition={{ duration: 0.28, ease: EASE }}
                    className="flex items-center w-full"
                  >
                    {LENSES.map((lens) => {
                      const Icon = lens.icon;
                      const isCurrent = mode === lens.key;
                      return (
                        <button
                          key={lens.key}
                          onClick={() => selectLens(lens.key)}
                          className="relative flex flex-col items-center justify-center flex-1 h-full spring-tap"
                          aria-label={`Switch to ${lens.label}`}
                        >
                          {isCurrent && (
                            <motion.div
                              layoutId="lens-active"
                              className="absolute inset-1.5 rounded-[22px] luxury-capsule"
                              transition={SPRING}
                            />
                          )}
                          <motion.div
                            animate={{ scale: isCurrent ? 1.12 : 1 }}
                            transition={ICON_SPRING}
                            className="relative flex flex-col items-center gap-1"
                          >
                            <Icon
                              className={`w-[28px] h-[28px] transition-colors duration-300 ${isCurrent ? "dock-icon-active" : "dock-icon"}`}
                              strokeWidth={isCurrent ? 2.2 : 1.7}
                            />
                            <span className={`text-[10px] font-medium tracking-tight transition-colors duration-300 ${isCurrent ? "dock-label-active" : "dock-label"}`}>
                              {lens.label}
                            </span>
                          </motion.div>
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ═══ Divider ═══ */}
            <div className="w-px self-center h-11 bg-border/50 shrink-0" />

            {/* ═══ RIGHT: Me Button — permanently fixed ═══ */}
            <MeButton
              active={isActive(pathname, "/me")}
              onClick={() => handleNav("/me")}
            />
          </div>
        </div>
      </motion.nav>
    </MotionConfig>
  );
}

/**
 * NavTab — a single destination inside the adaptive capsule.
 * Active state: icon grows, capsule morphs in, label strengthens.
 */
function NavTab({ tab, active, onClick }) {
  const Icon = tab.icon;

  return (
    <button
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      aria-label={tab.label}
      className="relative flex flex-col items-center justify-center flex-1 h-full min-w-0 spring-tap"
    >
      {active && (
        <motion.div
          layoutId="nav-active"
          className="absolute inset-1.5 rounded-[22px] luxury-capsule"
          transition={SPRING}
        />
      )}
      <motion.div
        animate={{ scale: active ? 1.1 : 1, y: active ? -2 : 0 }}
        transition={ICON_SPRING}
        className="relative flex flex-col items-center gap-1"
      >
        <Icon
          className={`w-[28px] h-[28px] transition-colors duration-300 ${active ? "dock-icon-active" : "dock-icon"}`}
          strokeWidth={active ? 2.2 : 1.7}
        />
        <span className={`text-[10px] font-medium tracking-tight transition-colors duration-300 ${active ? "dock-label-active" : "dock-label"}`}>
          {tab.label}
        </span>
      </motion.div>
    </button>
  );
}

/**
 * MeButton — the fixed identity button. Never moves, never animates horizontally.
 * Only its internal scale/color changes when active.
 */
function MeButton({ active, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      aria-label="Me"
      className="relative flex items-center justify-center w-[72px] h-full shrink-0 spring-tap"
    >
      {active && (
        <motion.div
          layoutId="nav-active"
          className="absolute inset-1.5 rounded-[22px] luxury-capsule"
          transition={SPRING}
        />
      )}
      <motion.div
        animate={{ scale: active ? 1.08 : 1 }}
        transition={ICON_SPRING}
        className="relative"
      >
        <div className={`w-[38px] h-[38px] rounded-full grid place-items-center transition-colors duration-300 ${active ? "bg-foreground/10 dock-icon-active" : "dock-icon"}`}>
          <MeIcon className="w-[24px] h-[24px]" strokeWidth={active ? 2.2 : 1.7} />
        </div>
      </motion.div>
    </button>
  );
}