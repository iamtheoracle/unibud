import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { hapticTap } from "@/lib/haptics";
import { AUDIENCE_CARDS } from "./audienceConstants";

const EASE = [0.16, 1, 0.3, 1];

/**
 * AudienceSelector — floating glass pill in the camera viewfinder.
 * Shows the current audience and expands to a horizontal glass panel
 * of audience cards so students choose where content goes before capture.
 */
export default function AudienceSelector({ value, onChange }) {
  const [expanded, setExpanded] = useState(false);
  const current = AUDIENCE_CARDS.find((a) => a.id === value) || AUDIENCE_CARDS[2];
  const CurrentIcon = current.icon;

  return (
    <div className="relative">
      <button
        onClick={() => { hapticTap(); setExpanded(!expanded); }}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-strong spring-tap"
      >
        <CurrentIcon className="w-3.5 h-3.5 text-white" strokeWidth={1.8} />
        <span className="text-[11px] font-semibold text-white">{current.label}</span>
        <ChevronDown className={"w-3 h-3 text-white/60 transition-transform duration-300 " + (expanded ? "rotate-180" : "")} />
      </button>

      <AnimatePresence>
        {expanded && (
          <>
            <div className="fixed inset-0 z-20" onClick={() => setExpanded(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.25, ease: EASE }}
              className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-30 p-2 rounded-2xl glass-strong flex gap-1.5"
            >
              {AUDIENCE_CARDS.map((card) => {
                const Icon = card.icon;
                const active = value === card.id;
                return (
                  <button
                    key={card.id}
                    onClick={() => {
                      hapticTap();
                      onChange(card.id);
                      setExpanded(false);
                    }}
                    className={"flex flex-col items-center gap-1 px-3 py-2 rounded-xl spring-tap min-w-[56px] transition-colors " + (active ? "bg-white text-black" : "text-white/70 hover:text-white")}
                  >
                    <Icon className="w-4 h-4" strokeWidth={1.8} />
                    <span className="text-[9px] font-semibold">{card.label}</span>
                  </button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}