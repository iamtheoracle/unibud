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
import QuickAccessStrip from "@/components/navigation/QuickAccessStrip";

/* ── Spring physics — visionOS standard ── */
const SPRING = { type: "spring", stiffness: 420, damping: 34, mass: 0.9 };
const ICON_SPRING = { type: "spring", stiffness: 420, damping: 34, mass: 0.8 };
const EASE = [0.16, 1, 0.3, 1];
const DOCK_ENTER = { duration: 0.55, ease: EASE };
const LENS_AUTO_DISMISS_MS = 3500;
const SWIPE_THRESHOLD = 35;

/* ── Academic mode tabs ── */
const ACADEMIC_TABS = [
  { key: "campus", label: "Campus", to: "/campus", icon: CampusIcon },
  { key: "quad", label: "Quad", to: "/quad", icon: QuadIcon },
  { key: "connect", label: "Connect", to: "/connect", icon: ConnectIcon },
];

/* ── Social mode tabs ── */
const SOCIAL_TABS = [
  { key: "square", label: "Square", to: "/square", icon: SquareIcon },
  { key: "discover", label: "Discover", to: "/discover", icon: DiscoverIcon },
  { key: "connect", label: "Connect", to: "/connect", icon: ConnectIcon },
];

/* ── Lens selector ── */
const LENSES = [
  { key: "social", label: "Social", icon: SocialLensIcon },
  { key: "academic", label: "Academics", icon: AcademicLensIcon },
];

function isActive(pathname, to) {
  return pathname === to || pathname.startsWith(to + "/");
}

export default function AdaptiveNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { mode, setMode } = useExperience();
  const pathname = location.pathname;

  const [navState, setNavState] = useState("tabs");
  const touchStartX = useRef(0);
  const lensTimerRef = useRef(null);

  const currentTabs = mode === "social" ? SOCIAL_TABS : ACADEMIC_TABS;

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
        <div className="flex flex-col items-center gap-2 px-3 pb-3 safe-area-pb pointer-events-auto">
          {/* ── Quick Access Strip — near-invisible ── */}
          <QuickAccessStrip />

          {/* ── Navigation Dock — two independent capsules ── */}
          <div className="flex items-end justify-center gap-3">
            {/* ═══ LEFT: Adaptive Capsule ═══ */}
            <div
              className="os-dock h-[92px] rounded-full flex items-center px-2"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <AnimatePresence mode="wait">
                {navState === "tabs" ? (
                  <motion.div
                    key={`tabs-${mode}`}
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.94 }}
                    transition={{ duration: 0.28, ease: EASE }}
                    className="flex items-center gap-1"
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
                  <motion.div
                    key="lens-selector"
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.94 }}
                    transition={{ duration: 0.28, ease: EASE }}
                    className="flex items-center gap-1"
                  >
                    {LENSES.map((lens) => (
                      <LensButton
                        key={lens.key}
                        lens={lens}
                        isCurrent={mode === lens.key}
                        onClick={() => selectLens(lens.key)}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ═══ RIGHT: Me Capsule — independent, never morphs ═══ */}
            <MeCapsule
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
 * NavTab — large nav item inside the adaptive capsule.
 * Active: expands to pill with icon + label.
 * Inactive: icon-only, compact.
 */
function NavTab({ tab, active, onClick }) {
  const Icon = tab.icon;

  return (
    <button
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      aria-label={tab.label}
      className="relative flex items-center justify-center h-[76px] min-w-[60px] spring-tap"
    >
      {active && (
        <motion.div
          layoutId="nav-active-pill"
          className="absolute inset-0 rounded-full os-pill-active"
          transition={SPRING}
        />
      )}
      <div className="relative flex items-center justify-center gap-2.5 px-5">
        <motion.div animate={{ scale: active ? 1 : 0.9 }} transition={ICON_SPRING}>
          <Icon
            className={`w-[30px] h-[30px] transition-colors duration-300 ${active ? "text-foreground" : "text-muted-foreground"}`}
            strokeWidth={active ? 2.2 : 1.7}
          />
        </motion.div>
        <AnimatePresence>
          {active && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.22, ease: EASE }}
              className="text-[15px] font-semibold text-foreground whitespace-nowrap tracking-tight"
            >
              {tab.label}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </button>
  );
}

/**
 * LensButton — temporary mode switcher inside the adaptive capsule.
 */
function LensButton({ lens, isCurrent, onClick }) {
  const Icon = lens.icon;

  return (
    <button
      onClick={onClick}
      className="relative flex items-center justify-center h-[76px] w-[104px] spring-tap"
      aria-label={`Switch to ${lens.label}`}
    >
      {isCurrent && (
        <motion.div
          layoutId="nav-active-pill"
          className="absolute inset-0 rounded-full os-pill-active"
          transition={SPRING}
        />
      )}
      <motion.div
        animate={{ scale: isCurrent ? 1.1 : 1 }}
        transition={ICON_SPRING}
        className="relative flex flex-col items-center gap-1"
      >
        <Icon
          className={`w-[30px] h-[30px] transition-colors duration-300 ${isCurrent ? "text-foreground" : "text-muted-foreground"}`}
          strokeWidth={isCurrent ? 2.2 : 1.7}
        />
        <span className={`text-[11px] font-semibold tracking-tight transition-colors duration-300 ${isCurrent ? "text-foreground" : "text-muted-foreground"}`}>
          {lens.label}
        </span>
      </motion.div>
    </button>
  );
}

/**
 * MeCapsule — independent floating circular capsule.
 * Never morphs. Never changes position. Always on the right.
 */
function MeCapsule({ active, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      aria-label="Me"
      className="os-me-capsule w-[76px] h-[76px] rounded-full flex items-center justify-center shrink-0 spring-tap relative"
    >
      {active && (
        <motion.div
          layoutId="me-active-pill"
          className="absolute inset-1 rounded-full os-pill-active"
          transition={SPRING}
        />
      )}
      <motion.div
        animate={{ scale: active ? 1.08 : 1 }}
        transition={ICON_SPRING}
        className="relative"
      >
        <div className={`w-[44px] h-[44px] rounded-full grid place-items-center transition-colors duration-300 ${active ? "text-foreground" : "text-muted-foreground"}`}>
          <MeIcon className="w-[26px] h-[26px]" strokeWidth={active ? 2.2 : 1.7} />
        </div>
      </motion.div>
    </button>
  );
}