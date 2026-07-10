import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { Sparkles, ChevronUp } from "lucide-react";
import { useBudPanel } from "@/lib/BudPanelContext";
import { getScreenContext } from "@/lib/budScreenContext";
import { hapticTap } from "@/lib/haptics";
import ProactiveBud from "@/components/bud/ProactiveBud";

export default function CommandDock() {
  const location = useLocation();
  const { openBud } = useBudPanel();
  const [expanded, setExpanded] = useState(false);
  const dockRef = useRef(null);

  const pathname = location.pathname;
  const screenContext = getScreenContext(pathname);
  const actions = screenContext.actions;

  useEffect(() => {
    setExpanded(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dockRef.current && !dockRef.current.contains(e.target)) {
        setExpanded(false);
      }
    };
    if (expanded) {
      document.addEventListener("touchstart", handleClickOutside);
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [expanded]);

  const handleAction = (action) => {
    hapticTap();
    setExpanded(false);
    openBud(action.prompt);
  };

  return (
    <div
      ref={dockRef}
      className="fixed bottom-[88px] left-0 right-0 z-50 pointer-events-none"
    >
      <div className="max-w-lg mx-auto px-4 flex justify-end">
        <div className="pointer-events-auto relative">
          {/* Proactive Bud card (when collapsed) */}
          {!expanded && <ProactiveBud onAction={(prompt) => openBud(prompt)} />}

          {/* Expanded quick actions */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
                className="flex flex-col gap-1.5 mb-2"
              >
                {/* Ask Bud - always first */}
                <motion.button
                  initial={{ opacity: 0, x: 24, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 24, scale: 0.8 }}
                  transition={{ delay: 0, type: "spring", stiffness: 400, damping: 24 }}
                  onClick={() => { hapticTap(); setExpanded(false); openBud(); }}
                  className="flex items-center gap-2.5 pl-2 pr-4 py-2 rounded-full glass spring-tap self-end"
                >
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-primary-foreground" strokeWidth={2} />
                  </div>
                  <span className="text-[12px] font-semibold text-foreground whitespace-nowrap">
                    Ask Bud
                  </span>
                </motion.button>

                {/* Context-aware actions */}
                <AnimatePresence>
                  {actions.map((action, i) => {
                    const Icon = action.icon;
                    return (
                      <motion.button
                        key={action.label}
                        initial={{ opacity: 0, x: 24, scale: 0.8 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 24, scale: 0.8 }}
                        transition={{ delay: (i + 1) * 0.04, type: "spring", stiffness: 400, damping: 24 }}
                        onClick={() => handleAction(action)}
                        className="flex items-center gap-2.5 pl-2 pr-4 py-2 rounded-full glass spring-tap self-end"
                      >
                        <div className="w-8 h-8 rounded-full bg-primary/12 flex items-center justify-center">
                          <Icon className="w-4 h-4 text-primary" strokeWidth={2} />
                        </div>
                        <span className="text-[12px] font-semibold text-foreground whitespace-nowrap">
                          {action.label}
                        </span>
                      </motion.button>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Bud button */}
          <div className="flex items-end gap-2">
            {/* Expand toggle */}
            <motion.button
              onClick={() => { hapticTap(); setExpanded(!expanded); }}
              whileTap={{ scale: 0.88 }}
              className="w-9 h-9 rounded-full flex items-center justify-center glass spring-tap"
              aria-label={expanded ? "Close quick actions" : "Open quick actions"}
            >
              <motion.div
                animate={{ rotate: expanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronUp className="w-4 h-4 text-foreground" strokeWidth={2.2} />
              </motion.div>
            </motion.button>

            {/* Bud FAB - opens panel */}
            <motion.button
              onClick={() => { hapticTap(); openBud(); }}
              whileTap={{ scale: 0.88 }}
              whileHover={{ scale: 1.05 }}
              className="w-14 h-14 rounded-full flex items-center justify-center bg-primary text-primary-foreground shadow-[0_4px_24px_rgba(212,175,55,0.35)] relative"
              aria-label="Open Bud"
            >
              <Sparkles className="w-6 h-6" strokeWidth={2} />

              {/* Pulsing ring */}
              {!expanded && (
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-primary"
                  initial={{ scale: 1, opacity: 0.5 }}
                  animate={{ scale: 1.4, opacity: 0 }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                />
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}