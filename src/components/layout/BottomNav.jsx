import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, MessageSquareText, Sparkles, User } from "lucide-react";
import { hapticSelect } from "@/lib/haptics";
import { useAdaptiveContext } from "@/hooks/useAdaptiveContext";
import { getDomain } from "@/lib/navigation/contextMap";

/**
 * BottomNav — the Adaptive Navigation dock.
 *
 * Four slots: Academic · Quad · Bud · [Adaptive].
 * The 4th slot is a Context Navigator that surfaces the most relevant
 * secondary destination for the current workspace, then settles back to
 * "Me" once the user engages. Bud stays globally accessible as slot 3.
 */
const PERMANENT = [
  { key: "academic", label: "Academic", to: "/academics", icon: GraduationCap, domain: "academic" },
  { key: "quad", label: "Quad", to: "/quad", icon: MessageSquareText, domain: "quad" },
  { key: "bud", label: "Bud", to: "/bud", icon: Sparkles, domain: "bud" },
];

const SPRING = { type: "spring", stiffness: 380, damping: 30 };
const SOFT_SPRING = { type: "spring", stiffness: 320, damping: 22 };

export default function BottomNav() {
  const { pathname } = useLocation();
  const { ctx, phase } = useAdaptiveContext();
  const domain = getDomain(pathname);
  const showContext = phase === "context" && !!ctx;
  const contextIsAnchor = showContext && domain === "standalone";

  const activeSlot =
    domain === "academic" ? 0 :
    domain === "quad" ? 1 :
    domain === "bud" ? 2 :
    domain === "me" ? 3 :
    contextIsAnchor ? 3 : -1;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 pointer-events-none">
      <div className="max-w-[520px] mx-auto px-5 pb-5 safe-area-pb pointer-events-auto">
        <div className="founder-dock rounded-[28px] h-[64px] flex items-center justify-around px-2 relative edge-light">
          {PERMANENT.map((t, i) => (
            <PermanentSlot key={t.key} tab={t} active={activeSlot === i} />
          ))}
          <AdaptiveSlot
            active={activeSlot === 3}
            showContext={showContext}
            contextIsAnchor={contextIsAnchor}
            ctx={ctx}
          />
        </div>
      </div>
    </nav>
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

function AdaptiveSlot({ active, showContext, contextIsAnchor, ctx }) {
  return (
    <div className="relative flex-1 h-full">
      {active && <ActivePill />}
      <div className="absolute inset-0 flex items-center justify-center">
        <AnimatePresence initial={false} mode="wait">
          {showContext && ctx ? (
            <ContextButton key="ctx" ctx={ctx} anchor={contextIsAnchor} />
          ) : (
            <MeButton key="me" active={active} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ContextButton({ ctx, anchor }) {
  const Icon = ctx.icon;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: anchor ? 1.08 : 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={SOFT_SPRING}
      className="relative flex flex-col items-center justify-center"
    >
      <NavLink to={ctx.to} onClick={() => hapticSelect()} className="relative flex flex-col items-center spring-tap">
        <div className="relative w-[20px] h-[20px] mb-0.5 flex items-center justify-center">
          <Icon className="w-[20px] h-[20px] dock-icon-active" strokeWidth={2.2} />
          <motion.div
            className="absolute -inset-2 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, hsl(var(--dock-icon-active) / 0.32), transparent 70%)" }}
            animate={{ opacity: [0.35, 0.75, 0.35], scale: [1, 1.18, 1] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        <span className="text-[10px] font-semibold dock-label-active">{ctx.label}</span>
      </NavLink>
    </motion.div>
  );
}

function MeButton({ active }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: active ? 1.06 : 1, y: active ? -1 : 0 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={SOFT_SPRING}
      className="relative flex flex-col items-center justify-center"
    >
      <NavLink to="/me" onClick={() => hapticSelect()} className="relative flex flex-col items-center spring-tap">
        <User
          className={`w-[20px] h-[20px] mb-0.5 transition-colors duration-200 ${active ? "dock-icon-active" : "dock-icon"}`}
          strokeWidth={active ? 2.3 : 1.9}
        />
        <span className={`text-[10px] font-semibold transition-colors duration-200 ${active ? "dock-label-active" : "dock-label"}`}>Me</span>
        {active && <BreathingDot />}
      </NavLink>
    </motion.div>
  );
}