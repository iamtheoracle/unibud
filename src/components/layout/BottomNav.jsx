import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { GraduationCap, Users, User } from "lucide-react";
import { hapticSelect } from "@/lib/haptics";
import { useAdaptiveContext } from "@/hooks/useAdaptiveContext";
import { getDomain } from "@/lib/navigation/contextMap";
import ContextNavigator from "@/components/layout/ContextNavigator";

/**
 * BottomNav — the UNIBUD adaptive navigation dock.
 *
 * Three fixed tabs — Academic · Social · Me — plus a dynamic, movable
 * Context Navigator (class 3) that surfaces contextual destinations for the
 * current workspace. The Context Navigator is prominent on workspace entry
 * and recedes to a draggable chip once the user engages. Bud remains
 * globally accessible via the floating Bud orb, not the dock.
 */
const PERMANENT = [
  { key: "academic", label: "Academic", to: "/academics", icon: GraduationCap },
  { key: "social", label: "Social", to: "/social", icon: Users },
  { key: "me", label: "Me", to: "/me", icon: User },
];

const SPRING = { type: "spring", stiffness: 380, damping: 30 };
const SOFT_SPRING = { type: "spring", stiffness: 320, damping: 22 };

export default function BottomNav() {
  const { pathname } = useLocation();
  const { workspace, phase, expand } = useAdaptiveContext();
  const domain = getDomain(pathname);
  const activeSlot =
    domain === "academic" ? 0 :
    domain === "social" ? 1 :
    domain === "me" ? 2 : -1;

  return (
    <>
      <ContextNavigator workspace={workspace} phase={phase} onExpand={expand} />
      <nav className="fixed bottom-0 inset-x-0 z-40 pointer-events-none">
        <div className="max-w-[520px] mx-auto px-5 pb-5 safe-area-pb pointer-events-auto">
          <div className="founder-dock rounded-[28px] h-[64px] flex items-center justify-around px-2 relative edge-light">
            {PERMANENT.map((t, i) => (
              <PermanentSlot key={t.key} tab={t} active={activeSlot === i} />
            ))}
          </div>
        </div>
      </nav>
    </>
  );
}

function ActivePill() {
  return (
    <motion.div
      layoutId="dock-active-pill"
      className="absolute inset-1.5 rounded-[20px] dock-pill"
      style={{ boxShadow: "0 2px 12px rgba(37,99,235,0.10), inset 0 1px 0 rgba(255,255,255,0.08)" }}
      transition={SPRING}
    />
  );
}

function BreathingDot() {
  return (
    <motion.div
      className="absolute -bottom-1.5 w-1 h-1 rounded-full dock-dot"
      animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.4, 1] }}
      transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

function PermanentSlot({ tab, active }) {
  const Icon = tab.icon;
  return (
    <NavLink
      to={tab.to}
      onClick={() => hapticSelect()}
      className="relative flex flex-col items-center justify-center flex-1 h-full spring-tap"
    >
      {active && <ActivePill />}
      <motion.div
        animate={{ scale: active ? 1.06 : 1, y: active ? -1 : 0 }}
        transition={SOFT_SPRING}
        className="relative flex flex-col items-center"
      >
        <Icon
          className={`w-[20px] h-[20px] mb-0.5 transition-colors duration-200 ${active ? "dock-icon-active" : "dock-icon"}`}
          strokeWidth={active ? 2.3 : 1.9}
        />
        <span className={`text-[10px] font-semibold transition-colors duration-200 ${active ? "dock-label-active" : "dock-label"}`}>
          {tab.label}
        </span>
        {active && <BreathingDot />}
      </motion.div>
    </NavLink>
  );
}