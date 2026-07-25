import React from "react";
import { useBudLauncher } from "@/lib/BudLauncherContext";

/**
 * BudOrb — the floating Bud button above the bottom navigation.
 * Opens Bud instantly. (A Bud visual will be added here once provided.)
 */
export default function BudOrb() {
  const { setOpen } = useBudLauncher();
  return (
    <button
      onClick={() => setOpen(true)}
      aria-label="Open Bud"
      className="fixed bottom-[88px] left-1/2 -translate-x-1/2 z-40 spring-tap"
    >
      <span className="px-5 h-12 rounded-full glass-strong text-primary font-heading font-semibold text-[14px] flex items-center ice-glow glow-pulse">
        Bud
      </span>
    </button>
  );
}