import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, X, BellOff, ChevronRight, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { useToolRecommendations } from "@/hooks/useToolRecommendations";
import { ALL_RECOMMENDATION_TYPES, TYPE_LABELS } from "@/lib/spark/recommendations/sparkRecommendations";

const EASE = [0.16, 1, 0.3, 1];

/**
 * ToolRecommendationStrip — a single, non-intrusive Spark suggestion card.
 * Accept navigates to the recommended tool; Dismiss hides it for a cooldown;
 * "Turn off" permanently disables that suggestion type. A Manage sheet lets
 * the student toggle all types and the global switch.
 */
export default function ToolRecommendationStrip({ surface = "home", context = {} }) {
  const navigate = useNavigate();
  const { recommendations, prefs, accept, dismiss, disable, setEnabled, reenableType } = useToolRecommendations({ surface, ...context });
  const [manage, setManage] = useState(false);
  const top = recommendations[0];

  if (!prefs) return null;

  if (prefs.enabled === false) {
    return (
      <>
        <button onClick={() => setManage(true)} className="glass-card px-3.5 py-2.5 flex items-center gap-2 w-full spring-tap">
          <BellOff className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground flex-1 text-left">Spark suggestions are off</span>
          <span className="text-[11px] font-semibold text-accent">Manage</span>
        </button>
        {manage && <PrefsSheet onClose={() => setManage(false)} prefs={prefs} setEnabled={setEnabled} reenableType={reenableType} />}
      </>
    );
  }

  return (
    <>
      <AnimatePresence>
        {top && (
          <motion.div
            key={top.type}
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="glass-card p-3.5 border border-accent/15 relative"
          >
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-accent/15 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-foreground leading-tight">{top.title}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{top.description}</p>
                <div className="flex items-center gap-1.5 mt-2.5">
                  <button onClick={() => accept(top, navigate)} className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-[11px] font-semibold spring-tap">
                    {top.actionLabel} <ChevronRight className="w-3 h-3" />
                  </button>
                  <button onClick={() => dismiss(top)} title="Not now" className="w-7 h-7 rounded-full hover:bg-muted/60 flex items-center justify-center text-muted-foreground spring-tap">
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => disable(top)} title="Don't show these" className="w-7 h-7 rounded-full hover:bg-muted/60 flex items-center justify-center text-muted-foreground spring-tap">
                    <BellOff className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
            <button onClick={() => setManage(true)} className="absolute top-2 right-2 text-[10px] font-semibold text-muted-foreground/70 hover:text-foreground px-1.5 py-1 spring-tap">
              Manage
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      {manage && <PrefsSheet onClose={() => setManage(false)} prefs={prefs} setEnabled={setEnabled} reenableType={reenableType} />}
    </>
  );
}

function PrefsSheet({ onClose, prefs, setEnabled, reenableType }) {
  const disabled = new Set(prefs?.disabled_types || []);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ duration: 0.32, ease: EASE }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[520px] glass-strong rounded-t-[28px] p-5 pb-8 safe-area-pb max-h-[80vh] overflow-y-auto no-scrollbar"
      >
        <div className="w-10 h-1 rounded-full bg-muted-foreground/30 mx-auto mb-4" />
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-accent" />
          <h3 className="font-heading font-bold text-foreground">Spark suggestions</h3>
        </div>
        <p className="text-[11px] text-muted-foreground mb-4">Spark only suggests tools when they add real value. Turn any type off — you can always re-enable it.</p>

        <div className="flex items-center justify-between glass-card px-3.5 py-3 mb-3">
          <div>
            <p className="text-[13px] font-semibold text-foreground">All suggestions</p>
            <p className="text-[11px] text-muted-foreground">{prefs?.enabled ? "On" : "Off"}</p>
          </div>
          <Switch checked={!!prefs?.enabled} onCheckedChange={(v) => setEnabled(v)} />
        </div>

        <p className="text-[11px] font-semibold text-muted-foreground mb-2 px-1">Suggestion types</p>
        <div className="space-y-2">
          {ALL_RECOMMENDATION_TYPES.map((t) => {
            const off = disabled.has(t);
            return (
              <div key={t} className="flex items-center justify-between glass-card px-3.5 py-2.5">
                <span className="text-[12px] text-foreground">{TYPE_LABELS[t] || t}</span>
                <button
                  onClick={() => off && reenableType(t)}
                  className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full spring-tap ${
                    off ? "bg-accent/15 text-accent" : "bg-muted/50 text-foreground/70"
                  }`}
                >
                  {off ? (<><Check className="w-3 h-3" /> Enable</>) : "On"}
                </button>
              </div>
            );
          })}
        </div>

        <button onClick={onClose} className="w-full mt-4 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold spring-tap">Done</button>
      </motion.div>
    </motion.div>
  );
}