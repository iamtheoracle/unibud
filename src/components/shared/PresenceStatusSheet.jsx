import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1];

export const STATUS_META = {
  online: { label: "Online", desc: "Available to chat", dot: "bg-success" },
  in_class: { label: "In Class", desc: "Currently in a lecture", dot: "bg-primary" },
  studying: { label: "Studying", desc: "Heads down — focus mode", dot: "bg-information" },
  busy: { label: "Busy", desc: "Reachable but occupied", dot: "bg-warning" },
  dnd: { label: "Do Not Disturb", desc: "Muting notifications", dot: "bg-destructive" },
  offline: { label: "Appear Offline", desc: "Hide your availability", dot: "bg-muted-foreground" },
};

const ORDER = ["online", "in_class", "studying", "busy", "dnd", "offline"];

/**
 * PresenceStatusSheet — premium status picker. The student chooses what to
 * broadcast; nothing is inferred without their action.
 */
export default function PresenceStatusSheet({ open, onClose, current, customMessage, onSet, saving }) {
  const [status, setStatus] = useState(current || "online");
  const [msg, setMsg] = useState(customMessage || "");

  useEffect(() => {
    if (open) { setStatus(current || "online"); setMsg(customMessage || ""); }
  }, [open, current, customMessage]);

  const save = () => {
    onSet({ status, custom_message: msg.trim() });
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center px-4 pb-6 sm:pb-0"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ duration: 0.32, ease: EASE }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[400px] rounded-[28px] glass-strong p-6 safe-area-pb"
          >
            <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted/60 flex items-center justify-center spring-tap">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
            <h2 className="font-heading font-bold text-[17px] text-foreground mb-1">Your status</h2>
            <p className="text-[12px] text-muted-foreground mb-4">Choose what friends see. You can change this anytime.</p>

            <div className="space-y-1.5 mb-4">
              {ORDER.map((key) => {
                const m = STATUS_META[key];
                const active = status === key;
                return (
                  <button key={key} onClick={() => setStatus(key)}
                    className={`w-full flex items-center gap-3 p-3 rounded-[16px] spring-tap text-left transition-colors ${active ? "bg-primary/10 ring-1 ring-primary/30" : "bg-muted/30"}`}>
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${m.dot}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-foreground">{m.label}</p>
                      <p className="text-[11px] text-muted-foreground">{m.desc}</p>
                    </div>
                    {active && <Check className="w-4 h-4 text-primary shrink-0" />}
                  </button>
                );
              })}
            </div>

            <label className="block text-[11px] font-semibold text-muted-foreground mb-1.5 ml-1">Status note (optional)</label>
            <input
              value={msg} onChange={(e) => setMsg(e.target.value)} maxLength={60}
              placeholder="e.g. In the library until 6"
              className="w-full h-11 px-3.5 rounded-[14px] bg-muted/40 border border-border text-[13px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/50 mb-5"
            />

            <button onClick={save} disabled={saving}
              className="w-full h-[50px] rounded-2xl bg-primary text-primary-foreground font-heading font-semibold text-[15px] flex items-center justify-center spring-tap disabled:opacity-50 ice-glow">
              {saving ? "Saving…" : "Set status"}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}