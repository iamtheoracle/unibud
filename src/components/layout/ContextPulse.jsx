import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useUnibudContext } from "@/lib/UnibudContext";
import { CloudSun, GraduationCap, Zap, BookOpen, Wallet, MessageSquare, CalendarDays, X } from "lucide-react";

const ICONS = {
  weather: CloudSun,
  lecture: GraduationCap,
  exam: Zap,
  dueToday: BookOpen,
  overdue: Wallet,
  messages: MessageSquare,
  attendance: CalendarDays,
};

const TONES = {
  information: "bg-information/15 text-information border-information/30",
  primary: "bg-primary/15 text-primary border-primary/30",
  warning: "bg-warning/15 text-warning border-warning/30",
  destructive: "bg-destructive/15 text-destructive border-destructive/30",
};

/**
 * ContextPulse — a Dynamic-Island-style contextual nudge rendered once in the
 * shell so every screen benefits from Bud's situational awareness. Appears
 * only when something is urgent, auto-dismisses, and is manually dismissible.
 */
export default function ContextPulse() {
  const ctx = useUnibudContext();
  const pulse = ctx?.pulse;
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!pulse) { setShow(false); return; }
    if (dismissed === pulse.key) { setShow(false); return; }
    setShow(true);
    const t = setTimeout(() => setShow(false), 9000);
    return () => clearTimeout(t);
  }, [pulse?.key, dismissed]);

  const act = () => {
    if (!pulse) return;
    setShow(false);
    if (pulse.actionTo === "weather") { navigate("/home"); return; }
    navigate(pulse.actionTo);
  };

  if (!pulse) return null;
  const Icon = ICONS[pulse.key] || Zap;
  const toneCls = TONES[pulse.tone] || TONES.primary;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key={pulse.key}
          initial={{ opacity: 0, y: -20, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 420, damping: 30 }}
          className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 safe-area-pt pointer-events-none"
        >
          <div className={`pointer-events-auto mt-2 max-w-[420px] w-full glass-strong rounded-[22px] border ${toneCls} px-3.5 py-2.5 flex items-center gap-3`}>
            <span className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${toneCls}`}>
              <Icon className="w-4 h-4" strokeWidth={2} />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-foreground leading-tight">{pulse.title}</p>
              <p className="text-[10.5px] text-muted-foreground leading-tight truncate">{pulse.message}</p>
            </div>
            <button
              onClick={act}
              className="px-2.5 py-1.5 rounded-full bg-foreground text-background text-[11px] font-semibold spring-tap flex-shrink-0"
            >
              {pulse.actionLabel}
            </button>
            <button
              onClick={() => { setDismissed(pulse.key); setShow(false); }}
              className="w-6 h-6 rounded-full flex items-center justify-center text-muted-foreground spring-tap flex-shrink-0"
              aria-label="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}