import React, { useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import {
  LayoutGrid as SquareIcon,
  Compass as DiscoverIcon,
  MessageSquare as ConnectIcon,
  GraduationCap as CampusIcon,
  Layers as QuadIcon,
  User as MeIcon,
  Users as SocialIcon,
  BookOpen as AcademicIcon,
} from "lucide-react";
import { hapticSelect, hapticTap, hapticImpact } from "@/lib/haptics";
import { useExperience } from "@/lib/ExperienceContext";
import QuickActionButton from "./QuickActionButton";
import QuickActionMenu from "./QuickActionMenu";

/* ── Spring physics — visionOS standard ── */
const SPRING = { type: "spring", stiffness: 420, damping: 34, mass: 0.9 };
const EASE = [0.16, 1, 0.3, 1];
const DOCK_ENTER = { duration: 0.55, ease: EASE };

/* ── Level 1: OS Mode Switcher ── */
const MODES = [
  { key: "social", label: "Social", icon: SocialIcon, defaultRoute: "/square" },
  { key: "academic", label: "Academics", icon: AcademicIcon, defaultRoute: "/campus" },
];

/* ── Level 2: Context Navigation ── */
const SOCIAL_CONTEXT = [
  { key: "square", label: "Square", to: "/square", icon: SquareIcon },
  { key: "discover", label: "Discovery", to: "/discover", icon: DiscoverIcon },
  { key: "connect", label: "Connect", to: "/connect", icon: ConnectIcon },
];

const ACADEMIC_CONTEXT = [
  { key: "campus", label: "Campus", to: "/campus", icon: CampusIcon },
  { key: "quad", label: "Quad", to: "/quad", icon: QuadIcon },
  { key: "connect", label: "Connect", to: "/connect", icon: ConnectIcon },
];

function isActive(pathname, to) {
  return pathname === to || pathname.startsWith(to + "/");
}

export default function AdaptiveNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { mode, setMode } = useExperience();
  const pathname = location.pathname;

  const contextTabs = mode === "social" ? SOCIAL_CONTEXT : ACADEMIC_CONTEXT;
  const meActive = isActive(pathname, "/me");
  const [quickAction, setQuickAction] = useState(null);

  const handleQuickAction = useCallback((itemKey, rect) => {
    hapticImpact();
    setQuickAction({ itemKey, rect });
  }, []);

  const handleModeSwitch = (newMode) => {
    if (newMode === mode) return;
    hapticSelect();
    setMode(newMode);
    const modeConfig = MODES.find((m) => m.key === newMode);
    if (modeConfig) navigate(modeConfig.defaultRoute);
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
          {/* ═══ Row 1: Mode Switcher + Me ═══ */}
          <div className="flex items-center gap-2.5">
            {/* Level 1: Chrome-style segmented mode switcher */}
            <div className="os-dock h-[50px] rounded-full flex items-center p-1">
              {MODES.map((m) => {
                const Icon = m.icon;
                const active = mode === m.key;
                return (
                  <QuickActionButton
                    key={m.key}
                    itemKey={m.key}
                    onClick={() => handleModeSwitch(m.key)}
                    onQuickAction={handleQuickAction}
                    aria-current={active ? "page" : undefined}
                    aria-label={`Switch to ${m.label} mode`}
                    className="relative flex items-center justify-center h-[42px] px-5"
                  >
                    {active && (
                      <motion.div
                        layoutId="mode-active-pill"
                        className="absolute inset-0 rounded-full os-pill-active"
                        transition={SPRING}
                      />
                    )}
                    <div className="relative flex items-center gap-2">
                      <Icon
                        className={`w-[19px] h-[19px] transition-colors duration-300 ${active ? "text-foreground" : "text-muted-foreground"}`}
                        strokeWidth={active ? 2.2 : 1.7}
                      />
                      <span className={`text-[14px] font-semibold tracking-tight transition-colors duration-300 ${active ? "text-foreground" : "text-muted-foreground"}`}>
                        {m.label}
                      </span>
                    </div>
                  </QuickActionButton>
                );
              })}
            </div>

            {/* Me — permanently fixed, independent */}
            <QuickActionButton
              itemKey="me"
              onClick={() => handleNav("/me")}
              onQuickAction={handleQuickAction}
              aria-current={meActive ? "page" : undefined}
              aria-label="Me"
              className="os-me-capsule w-[50px] h-[50px] rounded-full flex items-center justify-center shrink-0 relative"
            >
              {meActive && (
                <motion.div
                  layoutId="me-active-pill"
                  className="absolute inset-1 rounded-full os-pill-active"
                  transition={SPRING}
                />
              )}
              <div className="relative">
                <MeIcon
                  className={`w-[22px] h-[22px] transition-colors duration-300 ${meActive ? "text-foreground" : "text-muted-foreground"}`}
                  strokeWidth={meActive ? 2.2 : 1.7}
                />
              </div>
            </QuickActionButton>
          </div>

          {/* ═══ Row 2: Context Navigation ═══ */}
          <div className="os-dock h-[50px] rounded-full flex items-center p-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={`context-${mode}`}
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.28, ease: EASE }}
                className="flex items-center"
              >
                {contextTabs.map((tab) => {
                  const Icon = tab.icon;
                  const active = isActive(pathname, tab.to);
                  return (
                    <QuickActionButton
                      key={tab.key}
                      itemKey={tab.key}
                      onClick={() => handleNav(tab.to)}
                      onQuickAction={handleQuickAction}
                      aria-current={active ? "page" : undefined}
                      aria-label={tab.label}
                      className="relative flex items-center justify-center h-[42px] px-4"
                    >
                      {active && (
                        <motion.div
                          layoutId={`context-active-pill-${mode}`}
                          className="absolute inset-0 rounded-full os-pill-active"
                          transition={SPRING}
                        />
                      )}
                      <div className="relative flex items-center gap-2">
                        <Icon
                          className={`w-[18px] h-[18px] transition-colors duration-300 ${active ? "text-foreground" : "text-muted-foreground"}`}
                          strokeWidth={active ? 2.2 : 1.7}
                        />
                        <span className={`text-[13px] font-semibold tracking-tight transition-colors duration-300 ${active ? "text-foreground" : "text-muted-foreground"}`}>
                          {tab.label}
                        </span>
                      </div>
                    </QuickActionButton>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.nav>

      {/* Quick Action Menu — iOS Home Screen style long-press actions */}
      <AnimatePresence>
        {quickAction && (
          <QuickActionMenu quickAction={quickAction} onClose={() => setQuickAction(null)} />
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}