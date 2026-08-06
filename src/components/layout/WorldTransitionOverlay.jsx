import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigation } from "@/lib/os/NavigationContext";

/**
 * WorldTransitionOverlay — brief, premium blur flash when the user
 * switches between Social and Academics worlds.
 *
 * Feels like navigating a high-end OS: content briefly blurs and
 * darkens, then snaps back sharp. pointer-events:none so it never
 * blocks interaction.
 */
export default function WorldTransitionOverlay() {
  const { worldId } = useNavigation();
  const prevWorld = useRef(worldId);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (prevWorld.current !== worldId) {
      setActive(true);
      prevWorld.current = worldId;
      const t = setTimeout(() => setActive(false), 340);
      return () => clearTimeout(t);
    }
  }, [worldId]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="fixed inset-0 z-[55] pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 0.34, times: [0, 0.35, 1], ease: [0.16, 1, 0.3, 1] }}
          style={{
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            background: "rgba(11, 11, 11, 0.06)",
          }}
        />
      )}
    </AnimatePresence>
  );
}