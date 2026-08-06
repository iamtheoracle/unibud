import React from "react";
import { cn } from "@/lib/utils";
import { BUD_EMOTIONS } from "@/lib/uds/tokens";

/**
 * BudFigure — Bud's visual identity: a glass orb that breathes, blinks,
 * and expresses emotion. Dark/light compatible. Spark stays invisible.
 * emotion: idle | thinking | listening | speaking | celebrating | encouraging
 */
export default function BudFigure({ size = 120, emotion = "idle", className }) {
  const ring =
    emotion === "celebrating" ? "bud-celebrate"
    : emotion === "speaking" ? "bud-speak"
    : emotion === "listening" ? "bud-listen"
    : emotion === "encouraging" ? "bud-breathe"
    : "";

  return (
    <div className={cn("relative flex items-center justify-center", className)} style={{ width: size, height: size }} role="img" aria-label={`Bud — ${emotion}`}>
      <div className="absolute inset-0 radius-pill bg-primary/15 bud-breathe" />
      <div className={cn("absolute glass-strong radius-pill flex items-center justify-center", ring)} style={{ inset: size * 0.16, gap: size * 0.08 }}>
        <span className="bud-blink block rounded-full bg-primary" style={{ width: size * 0.1, height: size * 0.14 }} />
        <span className="bud-blink block rounded-full bg-primary" style={{ width: size * 0.1, height: size * 0.14, animationDelay: "0.18s" }} />
      </div>
      {emotion === "thinking" && <span className="absolute w-3 h-3 radius-pill bg-primary/50 animate-pulse-soft" style={{ top: size * 0.06, right: size * 0.12 }} />}
      {emotion === "celebrating" && <span className="absolute w-2 h-2 radius-pill bg-primary animate-pulse-soft" style={{ top: size * 0.04, left: size * 0.18 }} />}
    </div>
  );
}

export { BUD_EMOTIONS };