import React, { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion, MotionConfig } from "framer-motion";
import { User } from "lucide-react";
import { hapticSelect, hapticImpact } from "@/lib/haptics";
import { useExperience } from "@/lib/ExperienceContext";
import { getDomain } from "@/lib/navigation/contextMap";
import {
  MODE_SELECTOR_OPTIONS, MODE_NAV, MODE_HOME,
} from "@/lib/navigation/adaptiveNavConfig";

/**
 * AdaptiveNav — UNIBUD's premium, lightweight bottom navigation.
 * Left = morphing Adaptive Capsule (3 states); Right = fixed Me button.
 */
const SPRING = { type: "spring", stiffness: 420, damping: 32 };
const FADE = { duration: 0.2, ease: [0.16, 1, 0.3, 1] };

export default function AdaptiveNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { mode, setMode } = useExperience();
  const [navState, setNavState] = useState(mode);

  useEffect(() => {
    const d = getDomain(location.pathname);
    if (d === "academic" || d === "social") setNavState(d);
  }, [location.pathname]);

  const chooseMode = (m) => {
    hapticImpact();
    setMode(m);
    setNavState(m);
    navigate(MODE_HOME[m]);
  };

  const openSelector = () => { hapticSelect(); setNavState("selector"); };

  const isActive = (to) =>
    location.pathname === to || location.pathname.startsWith(to + "/");

  return (
    <MotionConfig reducedMotion="user">
      <nav className="fixed bottom-0 inset-x-0 z-40 pointer-events-none" aria-label="Primary">
        <div className="max-w-[520px] mx-auto px-4 pb-3.5 safe-area-pb pointer-events-auto">
          <div className="flex items-end justify-between gap-2">
            {/* ── Adaptive Navigation Capsule ── */}
            <motion.div
              layout
              transition={SPRING}
              className="founder-dock rounded-[18px] h-[50px] flex items-center gap-0.5 px-1 relative edge-light overflow-hidden w-fit max-w-[calc(100%-60px)]"
            >
              <motion.div
                key={navState}
                layout
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={FADE}
                className="flex items-center gap-0.5 w-full"
              >
                {navState === "selector" ? (
                  MODE_SELECTOR_OPTIONS.map((o) => (
                    <ModeButton key={o.key} opt={o} active={o.key === mode} onPick={chooseMode} />
                  ))
                ) : (
                  <>
                    <ModeOrb mode={navState} onClick={openSelector} />
                    <div className="w-px h-5 bg-white/10 shrink-0 mx-0.5" />
                    {MODE_NAV[navState].map((it) => (
                      <NavItem
                        key={it.key}
                        item={it}
                        active={isActive(it.to)}
                        onClick={() => { hapticSelect(); navigate(it.to); }}
                      />
                    ))}
                  </>
                )}
              </motion.div>
            </motion.div>

            {/* ── Me button — fixed right, never moves or resizes ── */}
            <MeButton active={getDomain(location.pathname) === "me"} />
          </div>
        </div>
      </nav>
    </MotionConfig>
  );
}

function ModeButton({ opt, active, onPick }) {
  const Icon = opt.icon;
  return (
    <button
      onClick={() => onPick(opt.key)}
      aria-pressed={active}
      className="relative flex items-center justify-center gap-1.5 h-[42px] px-3.5 flex-1 min-w-0 rounded-[12px] spring-tap"
    >
      {active && (
        <motion.div layoutId="cap-pill" className="absolute inset-1 rounded-[12px] dock-pill" transition={SPRING} />
      )}
      <Icon className={`relative w-[17px] h-[17px] ${active ? "dock-icon-active" : "dock-icon"}`} strokeWidth={active ? 2.3 : 1.9} />
      <span className={`relative text-[11px] font-semibold ${active ? "dock-label-active" : "dock-label"}`}>{opt.label}</span>
    </button>
  );
}

function ModeOrb({ mode, onClick }) {
  const Icon = MODE_SELECTOR_OPTIONS.find((o) => o.key === mode)?.icon;
  return (
    <button
      onClick={onClick}
      aria-label="Switch operating mode"
      className="relative flex items-center justify-center w-[38px] h-[42px] rounded-[12px] spring-tap shrink-0"
    >
      <Icon className="relative w-[16px] h-[16px] dock-icon" strokeWidth={2} />
    </button>
  );
}

function NavItem({ item, active, onClick }) {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className="relative flex flex-col items-center justify-center h-[42px] px-2 flex-1 min-w-0 rounded-[12px] spring-tap"
    >
      {active && (
        <motion.div layoutId="cap-pill" className="absolute inset-1 rounded-[12px] dock-pill" transition={SPRING} />
      )}
      <Icon className={`relative w-[17px] h-[17px] mb-0.5 ${active ? "dock-icon-active" : "dock-icon"}`} strokeWidth={active ? 2.3 : 1.9} />
      <span className={`relative text-[9px] font-semibold truncate ${active ? "dock-label-active" : "dock-label"}`}>{item.label}</span>
    </button>
  );
}

function MeButton({ active }) {
  return (
    <NavLink
      to="/me"
      onClick={() => hapticSelect()}
      aria-label="Me"
      className="founder-dock rounded-[18px] h-[50px] w-[50px] flex flex-col items-center justify-center relative edge-light spring-tap shrink-0"
    >
      {active && (
        <motion.div layoutId="me-pill" className="absolute inset-1.5 rounded-[16px] dock-pill" transition={SPRING} />
      )}
      <User className={`relative w-[18px] h-[18px] mb-0.5 ${active ? "dock-icon-active" : "dock-icon"}`} strokeWidth={active ? 2.3 : 1.9} />
      <span className={`relative text-[9px] font-semibold ${active ? "dock-label-active" : "dock-label"}`}>Me</span>
    </NavLink>
  );
}