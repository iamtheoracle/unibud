import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronUp } from "lucide-react";
import { useBudPanel } from "@/lib/BudPanelContext";
import { getScreenContext } from "@/lib/budScreenContext";
import { hapticTap } from "@/lib/haptics";
import ProactiveBud from "@/components/bud/ProactiveBud";

/**
 * CommandOrb — the floating Liquid Glass Command Orb at the center of the
 * V12 dock. A tap opens Bud; the small chevron expands context-aware quick
 * actions. Replaces the standalone CommandDock FAB.
 */
export default function CommandOrb() {
  const location = useLocation();
  const { openBud } = useBudPanel();
  const [expanded, setExpanded] = useState(false);
  const ref = useRef(null);
  const actions = getScreenContext(location.pathname).actions;

  useEffect(() => {
    setExpanded(false);
  }, [location.pathname]);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setExpanded(false);
    };
    if (expanded) {
      document.addEventListener("mousedown", onClick);
      document.addEventListener("touchstart", onClick);
    }
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("touchstart", onClick);
    };
  }, [expanded]);

  return (
    <div ref={ref} className="relative flex items-end gap-1.5 -my-2">
      {!expanded && (
        <div className="absolute bottom-[44px] right-0">
          <ProactiveBud onAction={(p) => openBud(p)} />
        </div>
      )}

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="absolute bottom-[56px] right-0 flex flex-col gap-1.5 items-end"
          >
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onClick={() => { hapticTap(); setExpanded(false); openBud(); }}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full glass spring-tap"
            >
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
              <span className="text-[11px] font-semibold whitespace-nowrap">Ask Bud</span>
            </motion.button>
            {actions.map((a, i) => {
              const Icon = a.icon;
              return (
                <motion.button
                  key={a.label}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: (i + 1) * 0.04 }}
                  onClick={() => { hapticTap(); setExpanded(false); openBud(a.prompt); }}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full glass spring-tap"
                >
                  <div className="w-7 h-7 rounded-full bg-primary/12 flex items-center justify-center">
                    <Icon className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="text-[11px] font-semibold whitespace-nowrap">{a.label}</span>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => { hapticTap(); setExpanded((v) => !v); }}
        whileTap={{ scale: 0.88 }}
        className="w-8 h-8 rounded-full flex items-center justify-center glass spring-tap"
        aria-label={expanded ? "Close quick actions" : "Open quick actions"}
      >
        <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronUp className="w-4 h-4 text-foreground" strokeWidth={2.2} />
        </motion.div>
      </motion.button>

      <motion.button
        onClick={() => { hapticTap(); openBud(); }}
        whileTap={{ scale: 0.88 }}
        className="w-12 h-12 rounded-full flex items-center justify-center bg-primary text-primary-foreground shadow-[0_6px_24px_hsl(var(--primary)/0.4)] relative spring-tap"
        aria-label="Open Bud"
      >
        <Sparkles className="w-5 h-5" strokeWidth={2.2} />
        {!expanded && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary"
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
          />
        )}
      </motion.button>
    </div>
  );
}