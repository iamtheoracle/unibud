import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, X, Timer } from "lucide-react";

const PRESETS = [
  { label: "5 min", seconds: 300 },
  { label: "10 min", seconds: 600 },
  { label: "15 min", seconds: 900 },
  { label: "30 min", seconds: 1800 },
  { label: "45 min", seconds: 2700 },
  { label: "1 hour", seconds: 3600 },
  { label: "End of episode", seconds: -1 },
];

/**
 * SleepTimerControl — lets listeners set a countdown after which
 * playback pauses automatically. Shows remaining time when active.
 */
export default function SleepTimerControl({ active, remaining, onSet, onCancel }) {
  const [open, setOpen] = useState(false);

  const fmtTime = (s) => {
    if (s <= 0) return "";
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${r < 10 ? "0" : ""}${r}`;
  };

  return (
    <>
      <button
        onClick={() => (active ? onCancel() : setOpen(true))}
        className={`w-8 h-8 rounded-full grid place-items-center spring-tap ${
          active ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground"
        }`}
        title="Sleep timer"
      >
        {active ? <Timer className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm px-4"
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-[24px] bg-card soft-shadow border border-border/40 p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading font-bold text-[15px] text-foreground flex items-center gap-2">
                  <Moon className="w-4 h-4 text-primary" /> Sleep Timer
                </h3>
                <button onClick={() => setOpen(false)} className="w-7 h-7 rounded-full bg-muted/60 grid place-items-center spring-tap">
                  <X className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>

              {active && remaining > 0 && (
                <div className="text-center mb-4 p-3 rounded-[16px] bg-primary/8">
                  <p className="text-[11px] font-semibold text-muted-foreground">Sleeping in</p>
                  <p className="font-heading font-extrabold text-[28px] text-primary tabular-nums">{fmtTime(remaining)}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => {
                      onSet(p.seconds);
                      setOpen(false);
                    }}
                    className="py-2.5 rounded-[14px] glass-card text-[12px] font-semibold text-foreground spring-tap"
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {active && (
                <button
                  onClick={() => {
                    onCancel();
                    setOpen(false);
                  }}
                  className="w-full mt-3 py-2.5 rounded-[14px] bg-destructive/10 text-destructive text-[12px] font-semibold spring-tap"
                >
                  Cancel timer
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}