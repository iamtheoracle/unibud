import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Check, X } from "lucide-react";
import { Link } from "react-router-dom";

const STORAGE_KEY = "unibud_consent";

const CATEGORIES = [
  { key: "necessary", label: "Necessary", desc: "Required for core functionality", required: true },
  { key: "analytics", label: "Analytics", desc: "Help us understand usage to improve UNIBUD", required: false },
  { key: "marketing", label: "Marketing", desc: "Notifications about new features and events", required: false },
];

export default function ConsentBanner() {
  const [visible, setVisible] = React.useState(false);
  const [expanded, setExpanded] = React.useState(false);
  const [prefs, setPrefs] = React.useState({ necessary: true, analytics: true, marketing: false });

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) setTimeout(() => setVisible(true), 1500);
    } catch {
      setTimeout(() => setVisible(true), 1500);
    }
  }, []);

  const save = (accepted) => {
    const finalPrefs = accepted ? prefs : { necessary: true, analytics: false, marketing: false };
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...finalPrefs, timestamp: Date.now() }));
    setVisible(false);
  };

  const togglePref = (key) => {
    if (key === "necessary") return;
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div className="fixed bottom-0 left-0 right-0 z-[200] flex justify-center px-4 pb-4 safe-area-px" initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }} transition={{ type: "spring", stiffness: 360, damping: 36 }}>
          <div className="w-full max-w-[500px] rounded-[24px] p-5" style={{ background: "rgba(20,14,10,0.98)", border: "1px solid rgba(255,138,42,0.15)", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-full grid place-items-center shrink-0" style={{ background: "rgba(255,138,42,0.12)" }}>
                <Shield className="w-5 h-5" style={{ color: "#FF8A2A" }} />
              </div>
              <div className="flex-1">
                <p className="text-[15px] font-bold" style={{ color: "#F7F0E8" }}>Your privacy matters</p>
                <p className="text-[12px] leading-relaxed mt-0.5" style={{ color: "rgba(247,240,232,0.50)" }}>
                  We use cookies to enhance your experience. You can choose what to enable. Read our{" "}
                  <Link to="/privacy" className="underline" style={{ color: "#FF8A2A" }}>Privacy Policy</Link>.
                </p>
              </div>
              <button onClick={() => save(false)} className="w-7 h-7 rounded-full grid place-items-center shrink-0 spring-tap" style={{ background: "rgba(255,255,255,0.05)" }}>
                <X className="w-4 h-4" style={{ color: "rgba(247,240,232,0.50)" }} />
              </button>
            </div>

            <AnimatePresence>
              {expanded && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="flex flex-col gap-2 mb-3">
                    {CATEGORIES.map((cat) => (
                      <div key={cat.key} className="flex items-center gap-3 p-3 rounded-[12px]" style={{ background: "rgba(255,255,255,0.03)" }}>
                        <div className="flex-1">
                          <p className="text-[13px] font-semibold" style={{ color: "#F7F0E8" }}>{cat.label}{cat.required && " (Required)"}</p>
                          <p className="text-[11px]" style={{ color: "rgba(247,240,232,0.50)" }}>{cat.desc}</p>
                        </div>
                        <button onClick={() => togglePref(cat.key)} disabled={cat.required} className="relative w-10 h-6 rounded-full transition-colors duration-300 shrink-0 disabled:opacity-60" style={{ background: prefs[cat.key] ? "#FF8A2A" : "rgba(255,255,255,0.08)" }} role="switch" aria-checked={prefs[cat.key]}>
                          <motion.span className="absolute top-0.5 w-5 h-5 rounded-full bg-white" animate={{ left: prefs[cat.key] ? 18 : 2 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} />
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-2">
              {!expanded && (
                <button onClick={() => setExpanded(true)} className="flex-1 h-11 rounded-[14px] text-[13px] font-semibold spring-tap" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(247,240,232,0.70)" }}>
                  Customize
                </button>
              )}
              <button onClick={() => save(false)} className="flex-1 h-11 rounded-[14px] text-[13px] font-semibold spring-tap" style={{ background: "rgba(255,255,255,0.08)", color: "#F7F0E8" }}>
                Decline
              </button>
              <button onClick={() => save(true)} className="flex-1 h-11 rounded-[14px] text-[13px] font-semibold flex items-center justify-center gap-1.5 spring-tap" style={{ background: "#FF8A2A", color: "#1a1208" }}>
                <Check className="w-4 h-4" /> Accept
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}