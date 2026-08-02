import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { Outlet } from "react-router-dom";
import AmbientBackground from "@/components/layout/AmbientBackground";
import GlobalNavDock from "@/components/layout/GlobalNavDock";
import BudFloatingAssistant from "@/components/bud/BudFloatingAssistant";
import { useAdaptiveTheme } from "@/lib/theme/AdaptiveThemeContext";

/**
 * PremiumShell — the main OS shell that ties everything together.
 * Features ambient background, adaptive theming, global nav dock,
 * and Bud floating assistant available everywhere.
 *
 * Wraps all student-facing pages with the unified OS experience.
 */
export default function PremiumShell() {
  const location = useLocation();
  const [budOpen, setBudOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const { setContext } = useAdaptiveTheme();

  // Route-based adaptive context
  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith("/study") || path.startsWith("/academics") || path.startsWith("/library")) {
      setContext("study");
    } else if (path.startsWith("/events") || path.startsWith("/campus")) {
      setContext("events");
    } else if (path.startsWith("/music") || path.startsWith("/podcasts")) {
      setContext("music");
    } else if (path.startsWith("/sports") || path.startsWith("/football")) {
      setContext("sports");
    } else if (path.startsWith("/marketplace")) {
      setContext("marketplace");
    } else if (path.startsWith("/career") || path.startsWith("/opportunities") || path.startsWith("/scholarships")) {
      setContext("career");
    } else if (path.startsWith("/wallet") || path.startsWith("/finance")) {
      setContext("finance");
    } else if (path.startsWith("/live")) {
      setContext("live");
    } else if (path.startsWith("/social") || path.startsWith("/connect") || path.startsWith("/messages") || path.startsWith("/quad")) {
      setContext("social");
    } else {
      setContext("default");
    }
  }, [location.pathname, setContext]);

  return (
    <div className="relative min-h-screen">
      {/* Ambient background */}
      <AmbientBackground variant="calm" orbs={3} />

      {/* Main content */}
      <div className="relative z-10 pb-28">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Global navigation dock */}
      <GlobalNavDock
        onOpenBud={() => setBudOpen(true)}
        onCreate={() => setCreateOpen(true)}
      />

      {/* Bud floating assistant */}
      <BudFloatingAssistant
        open={budOpen}
        onClose={() => setBudOpen(false)}
        onSend={(message, mode) => {
          // Route to Bud handler
          console.log("Bud message:", { message, mode, context: location.pathname });
        }}
        context={location.pathname}
      />
    </div>
  );
}