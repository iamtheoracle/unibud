import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Mic, Minus, Pin, Settings2 } from "lucide-react";
import BudVoiceOrb from "@/components/bud/BudVoiceOrb";
import { useBudLauncher } from "@/lib/BudLauncherContext";
import { useBudOrbPrefs } from "@/hooks/useBudOrbPrefs";
import BudOrbPrefsSheet from "@/components/bud/BudOrbPrefsSheet";

/**
 * BudLivingOrb — Bud as a floating, draggable living companion
 * (Apple AssistiveTouch-inspired). Customizable: side, height, auto-hide,
 * compact, and a persisted dock position. Sits above the workspace switcher
 * so it never overlaps the EcosystemRail.
 */
export default function BudLivingOrb() {
  const { setOpen, setVoiceMode } = useBudLauncher();
  const { prefs, update, reset } = useBudOrbPrefs();
  const [minimized, setMinimized] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const containerRef = useRef(null);
  const orbRef = useRef(null);
  const idleTimer = useRef(null);

  const size = prefs.compact ? 44 : 56;

  const basePos = (() => {
    if (prefs.dockX != null && prefs.dockY != null) {
      return { left: prefs.dockX, top: prefs.dockY };
    }
    if (typeof window === "undefined") return { left: 16, top: 144 };
    const sideOffset = 16;
    const left = prefs.side === "left" ? sideOffset : window.innerWidth - sideOffset - size;
    const top = Math.max(24, window.innerHeight - prefs.height - size);
    return { left, top };
  })();

  useEffect(() => {
    if (!prefs.autoHide) { setHidden(false); return; }
    const resetIdle = () => {
      setHidden(false);
      clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => setHidden(true), 6000);
    };
    resetIdle();
    window.addEventListener("pointerdown", resetIdle);
    window.addEventListener("scroll", resetIdle, true);
    return () => {
      clearTimeout(idleTimer.current);
      window.removeEventListener("pointerdown", resetIdle);
      window.removeEventListener("scroll", resetIdle, true);
    };
  }, [prefs.autoHide]);

  const onDragEnd = () => {
    const el = orbRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    update({ dockX: Math.round(r.left), dockY: Math.round(r.top) });
  };

  if (minimized) {
    return (
      <button
        onClick={() => setMinimized(false)}
        aria-label="Bring Bud back"
        className="fixed z-40 w-3 h-3 rounded-full bg-primary ice-glow glow-pulse spring-tap"
        style={{ left: basePos.left + size / 2 - 6, top: basePos.top + size / 2 - 6 }}
      />
    );
  }

  if (hidden) {
    return (
      <button
        onClick={() => { setHidden(false); setOpen(true); }}
        aria-label="Show Bud"
        className="fixed z-40 rounded-full bg-primary/80 ice-glow glow-pulse spring-tap"
        style={{ left: basePos.left, top: basePos.top, width: size, height: size }}
      />
    );
  }

  return (
    <div ref={containerRef} className="fixed inset-0 z-40 pointer-events-none">
      <motion.div
        ref={orbRef}
        drag={!pinned}
        dragConstraints={containerRef}
        dragElastic={0.12}
        dragMomentum={false}
        onDragEnd={onDragEnd}
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        style={{ position: "absolute", left: basePos.left, top: basePos.top, width: size, height: size }}
        className="pointer-events-auto"
      >
        <div className="relative" style={{ width: size, height: size }}>
          {/* tap to expand */}
          <button
            onClick={() => setOpen(true)}
            aria-label="Open Bud"
            className="absolute inset-0 rounded-full spring-tap"
          >
            <BudVoiceOrb size={size} state="idle" />
          </button>

          {/* voice */}
          <button
            onClick={() => { setVoiceMode(true); setOpen(true); }}
            aria-label="Bud voice mode"
            className="absolute -top-1 -right-1 w-7 h-7 rounded-full glass-strong text-primary flex items-center justify-center spring-tap ice-glow"
          >
            <Mic className="w-3.5 h-3.5" strokeWidth={2.4} />
          </button>

          {/* customize */}
          <button
            onClick={() => setPrefsOpen(true)}
            aria-label="Customize Bud"
            className="absolute -top-1 -left-1 w-6 h-6 rounded-full glass text-muted-foreground flex items-center justify-center spring-tap"
          >
            <Settings2 className="w-3 h-3" strokeWidth={2.5} />
          </button>

          {/* minimize */}
          <button
            onClick={() => setMinimized(true)}
            aria-label="Minimize Bud"
            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full glass text-muted-foreground flex items-center justify-center spring-tap"
          >
            <Minus className="w-3 h-3" strokeWidth={2.5} />
          </button>

          {/* pin (disables drag) */}
          <button
            onClick={() => setPinned((p) => !p)}
            aria-label={pinned ? "Unpin Bud" : "Pin Bud"}
            className={`absolute -bottom-1 -left-1 w-6 h-6 rounded-full glass flex items-center justify-center spring-tap ${pinned ? "text-primary" : "text-muted-foreground"}`}
          >
            <Pin className="w-3 h-3" strokeWidth={2.5} />
          </button>
        </div>
      </motion.div>

      <BudOrbPrefsSheet
        open={prefsOpen}
        onClose={() => setPrefsOpen(false)}
        prefs={prefs}
        update={update}
        reset={reset}
      />
    </div>
  );
}