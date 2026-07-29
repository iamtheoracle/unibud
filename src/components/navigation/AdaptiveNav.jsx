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
 * AdaptiveNav — UNIBUD's premium bottom navigation.
 *
 * Left  → Adaptive Navigation Capsule (morphs between 3 states):
 *            1. Mode selector   : Social | Academics
 *            2. Social mode     : Square | Discover | Connect
 *            3. Academic mode   : Campus | Quad | Connect
 *          A leading mode orb returns the capsule to the selector state.
 * Right → Me button (permanently fixed: never moves, resizes, or animates).
 *
 * Mode switching never reloads the app — it sets the ExperienceContext mode
 * and navigates to the mode home; the capsule morphs via width interpolation,
 * fade-through, and spring animations. Bud stays globally accessible via the
 * floating orb, not the dock.
 */

const SPRING = { type: "spring", stiffness: 380, damping: 30 };
const FADE = { duration: 0.22, ease: [0.16, 1, 0.3, 1] };

export default function AdaptiveNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { mode, setMode } = useExperience();
  // "academic" | "social" | "selector". Initial state mirrors the active mode.
  const [navState, setNavState] = useState(mode);

  // Keep the capsule aligned with the route's ecosystem on navigation.
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
        <div className="max-w-[520px] mx-auto px-4 pb-4 safe-area-pb pointer-events-auto">
          <div className="flex items-end justify-between gap-2">
            {/* ── Adaptive Navigation Capsule ── */}
            <motion.div
              layout
              transition={SPRING}
              className="founder-dock rounded-[24px] h-[60px] flex items-center gap-0.5 px-1.5 relative edge-light overflow-hidden w-fit max-w-[calc(100%-68px)]"
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
                    <div className="w-px h-6 bg-white/10 shrink-0 mx-0.5" />
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
      className="relative flex items-center justify-center gap-1.5 h-[48px] px-4 flex-1 min-w-0 rounded-[18px] spring-tap"
    >
      {active && (
        <motion.div layoutId="cap-pill" className="absolute inset-1 rounded-[14px] dock-pill" transition={SPRING} />
      )}
      <Icon className={`relative w-[18px] h-[18px] ${active ? "dock-icon-active" : "dock-icon"}`} strokeWidth={active ? 2.3 : 1.9} />
      <span className={`relative text-[12px] font-semibold ${active ? "dock-label-active" : "dock-label"}`}>{opt.label}</span>
    </button>
  );
}

function ModeOrb({ mode, onClick }) {
  const Icon = MODE_SELECTOR_OPTIONS.find((o) => o.key === mode)?.icon;
  return (
    <button
      onClick={onClick}
      aria-label="Switch operating mode"
      className="relative flex items-center justify-center w-[42px] h-[48px] rounded-[16px] spring-tap shrink-0"
    >
      <Icon className="relative w-[18px] h-[18px] dock-icon" strokeWidth={2} />
    </button>
  );
}

function NavItem({ item, active, onClick }) {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className="relative flex flex-col items-center justify-center h-[48px] px-2.5 flex-1 min-w-0 rounded-[16px] spring-tap"
    >
      {active && (
        <motion.div layoutId="cap-pill" className="absolute inset-1 rounded-[14px] dock-pill" transition={SPRING} />
      )}
      <Icon className={`relative w-[19px] h-[19px] mb-0.5 ${active ? "dock-icon-active" : "dock-icon"}`} strokeWidth={active ? 2.3 : 1.9} />
      <span className={`relative text-[9.5px] font-semibold truncate ${active ? "dock-label-active" : "dock-label"}`}>{item.label}</span>
    </button>
  );
}

function MeButton({ active }) {
  return (
    <NavLink
      to="/me"
      onClick={() => hapticSelect()}
      aria-label="Me"
      className="founder-dock rounded-[24px] h-[60px] w-[56px] flex flex-col items-center justify-center relative edge-light spring-tap shrink-0"
    >
      {active && (
        <motion.div layoutId="me-pill" className="absolute inset-1.5 rounded-[18px] dock-pill" transition={SPRING} />
      )}
      <User className={`relative w-[20px] h-[20px] mb-0.5 ${active ? "dock-icon-active" : "dock-icon"}`} strokeWidth={active ? 2.3 : 1.9} />
      <span className={`relative text-[9.5px] font-semibold ${active ? "dock-label-active" : "dock-label"}`}>Me</span>
    </NavLink>
  );
}