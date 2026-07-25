import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Mic, Minus, Pin } from "lucide-react";
import BudVoiceOrb from "@/components/bud/BudVoiceOrb";
import { useBudLauncher } from "@/lib/BudLauncherContext";

/**
 * BudLivingOrb — Bud as a floating, draggable living companion.
 * Deep Midnight Blue core, soft white glow, breathing. Tap to expand into the
 * companion panel; mic to enter voice mode; drag anywhere; minimize to a dot.
 */
export default function BudLivingOrb() {
  const { setOpen, setVoiceMode } = useBudLauncher();
  const [minimized, setMinimized] = useState(false);
  const [pinned, setPinned] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    // subtle entrance
    const t = setTimeout(() => {}, 0);
    return () => clearTimeout(t);
  }, []);

  if (minimized) {
    return (
      <button
        onClick={() => setMinimized(false)}
        aria-label="Bring Bud back"
        className="fixed bottom-[96px] left-1/2 -translate-x-1/2 z-40 w-3 h-3 rounded-full bg-primary ice-glow glow-pulse spring-tap"
      />
    );
  }

  return (
    <div ref={containerRef} className="fixed inset-0 z-40 pointer-events-none">
      <motion.div
        drag={!pinned}
        dragConstraints={containerRef}
        dragElastic={0.12}
        dragMomentum={false}
        initial={{ opacity: 0, scale: 0.7, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        style={{ position: "absolute", bottom: 92, left: "50%", marginLeft: -28 }}
        className="pointer-events-auto"
      >
        <div className="relative w-14 h-14">
          {/* tap to expand */}
          <button
            onClick={() => setOpen(true)}
            aria-label="Open Bud"
            className="absolute inset-0 rounded-full spring-tap"
          >
            <BudVoiceOrb size={56} state="idle" />
          </button>

          {/* voice */}
          <button
            onClick={() => { setVoiceMode(true); setOpen(true); }}
            aria-label="Bud voice mode"
            className="absolute -top-1 -right-1 w-7 h-7 rounded-full glass-strong text-primary flex items-center justify-center spring-tap ice-glow"
          >
            <Mic className="w-3.5 h-3.5" strokeWidth={2.4} />
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
    </div>
  );
}