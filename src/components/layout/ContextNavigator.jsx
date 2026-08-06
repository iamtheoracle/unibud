import React, { useRef } from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { hapticSelect } from "@/lib/haptics";

/**
 * ContextNavigator — the dynamic, movable 3rd navigation class.
 *
 * Two phases, both driven by useAdaptiveContext:
 *   • "context" — a prominent glass rail above the dock showing the
 *     workspace label and its contextual destinations.
 *   • "settled" — a compact, draggable chip the user can reposition; tapping
 *     it re-expands the prominent rail.
 *
 * The normal bottom dock (Academic · Social · Me) is always visible beneath.
 * Bud is intentionally not part of this navigator — it stays in its own orb.
 */
const SOFT_SPRING = { type: "spring", stiffness: 320, damping: 26 };

export default function ContextNavigator({ workspace, phase, onExpand }) {
  return (
    <AnimatePresence mode="wait">
      {workspace && phase === "context" ? (
        <ProminentRail key="rail" workspace={workspace} />
      ) : workspace ? (
        <MovableChip key="chip" workspace={workspace} onExpand={onExpand} />
      ) : null}
    </AnimatePresence>
  );
}

function ProminentRail({ workspace }) {
  const Icon = workspace.icon;
  return (
    <motion.div
      data-context-navigator
      className="fixed inset-x-0 z-40 flex justify-center px-4 pointer-events-none"
      style={{ bottom: 96 }}
      initial={{ opacity: 0, y: 28, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 28, scale: 0.96 }}
      transition={SOFT_SPRING}
    >
      <div className="pointer-events-auto max-w-[420px] w-full glass-strong rounded-[24px] px-3 py-2.5 flex items-center gap-2.5 edge-light ice-glow">
        <div className="flex items-center gap-2 pr-2.5 border-r border-border/60 flex-shrink-0">
          <span className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center">
            <Icon className="w-4 h-4 text-primary" strokeWidth={2.1} />
          </span>
          <span className="text-[12px] font-semibold text-foreground whitespace-nowrap">{workspace.label}</span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-1">
          {workspace.destinations.map((d) => (
            <DestinationChip key={d.to + d.label} dest={d} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function DestinationChip({ dest }) {
  const Icon = dest.icon;
  return (
    <NavLink
      to={dest.to}
      onClick={() => hapticSelect()}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-primary/10 hover:bg-primary/15 transition-colors flex-shrink-0 spring-tap"
    >
      <Icon className="w-3.5 h-3.5 text-primary" strokeWidth={2.1} />
      <span className="text-[11px] font-semibold text-primary whitespace-nowrap">{dest.label}</span>
    </NavLink>
  );
}

function MovableChip({ workspace, onExpand }) {
  const boundsRef = useRef(null);
  const Icon = workspace.icon;
  return (
    <motion.div
      ref={boundsRef}
      className="fixed inset-0 z-40 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
    >
      <motion.button
        type="button"
        drag
        dragConstraints={boundsRef}
        dragMomentum={false}
        dragElastic={0.12}
        whileTap={{ scale: 0.9 }}
        onTap={onExpand}
        initial={{ opacity: 0, scale: 0.6, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.6, y: 20 }}
        transition={SOFT_SPRING}
        className="absolute right-5 bottom-[104px] pointer-events-auto w-[52px] h-[52px] rounded-full crystal-dock flex items-center justify-center ice-glow spring-tap"
        aria-label={`${workspace.label} navigator`}
      >
        <Icon className="w-5 h-5 text-primary" strokeWidth={2.1} />
      </motion.button>
    </motion.div>
  );
}