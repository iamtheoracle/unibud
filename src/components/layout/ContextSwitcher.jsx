import React from "react";
import { motion } from "framer-motion";
import { useNavigation } from "@/lib/os/NavigationContext";
import { hapticSelect } from "@/lib/haptics";

/**
 * ContextSwitcher — the primary OS context switch at the top of every screen.
 *
 * This is NOT a segmented control. It is the world switcher that changes the
 * entire application: bottom navigation, content, Bud suggestions, and module
 * priority all update when the world changes.
 *
 * Two worlds: Social and Academics. Only one can be active.
 * Switching animates with a smooth slide + crossfade. Never reloads.
 *
 * Visual: black and white. Orange is reserved for the bottom nav.
 */
export default function ContextSwitcher() {
  const { isSocial, isAcademics, switchWorld } = useNavigation();

  return (
    <div className="sticky top-0 z-40 px-4 pt-2 safe-area-pt bg-background/80 backdrop-blur-xl">
      <div className="max-w-[440px] mx-auto">
        <div className="relative flex items-center p-1 rounded-full glass-strong">
          {/* Sliding indicator — always black */}
          <motion.div
            className="absolute top-1 bottom-1 rounded-full"
            style={{
              width: "calc(50% - 4px)",
              left: 4,
              background: "rgb(11, 11, 11)",
            }}
            animate={{ x: isSocial ? 0 : "calc(100% + 0px)" }}
            transition={{ type: "spring", stiffness: 380, damping: 38, mass: 0.8 }}
          />

          {/* Social */}
          <button
            onClick={() => { if (!isSocial) { hapticSelect(); switchWorld("social"); } }}
            className="relative z-10 flex-1 py-2 text-center text-[13px] font-bold tracking-tight transition-opacity duration-300"
          >
            <span style={{ color: isSocial ? "rgb(255, 255, 255)" : "hsl(var(--muted-foreground))" }}>
              Social
            </span>
          </button>

          {/* Academics */}
          <button
            onClick={() => { if (!isAcademics) { hapticSelect(); switchWorld("academics"); } }}
            className="relative z-10 flex-1 py-2 text-center text-[13px] font-bold tracking-tight transition-opacity duration-300"
          >
            <span style={{ color: isAcademics ? "rgb(255, 255, 255)" : "hsl(var(--muted-foreground))" }}>
              Academics
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}