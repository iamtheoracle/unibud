import React from "react";
import BudCharacter from "@/components/brand/BudCharacter";
import { useBudLauncher } from "@/lib/BudLauncherContext";

/**
 * BudOrb — the floating Bud companion above the bottom navigation.
 * Opens Bud instantly.
 */
export default function BudOrb() {
  const { setOpen } = useBudLauncher();
  return (
    <button
      onClick={() => setOpen(true)}
      aria-label="Open Bud"
      className="fixed bottom-[88px] left-1/2 -translate-x-1/2 z-40 spring-tap"
    >
      <div className="relative">
        <div
          className="absolute inset-0 rounded-full bud-breathe pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(127,216,255,0.45), transparent 65%)", filter: "blur(14px)" }}
        />
        <div className="relative w-14 h-14 rounded-full glass-strong overflow-hidden ice-glow ring-2 ring-primary/30">
          <BudCharacter animate={false} glow={false} className="w-full h-full" />
        </div>
      </div>
    </button>
  );
}