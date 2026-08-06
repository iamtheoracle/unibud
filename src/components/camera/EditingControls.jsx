import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCw, Sliders, Sun, Contrast, Droplet, Thermometer, RotateCcw } from "lucide-react";

/**
 * EditingControls — manual adjustment sliders for brightness, contrast,
 * saturation, and warmth. Also supports rotation.
 * All values: 1 = default (no change), range 0–2 (warmth: -1 to 1).
 */
export default function EditingControls({ adjustments, onAdjustmentsChange, onReset }) {
  const [expanded, setExpanded] = useState(false);

  const update = (key, value) => {
    onAdjustmentsChange({ ...adjustments, [key]: value });
  };

  const sliders = [
    { key: "brightness", label: "Brightness", icon: Sun, min: 0.5, max: 1.5, step: 0.01, default: 1 },
    { key: "contrast", label: "Contrast", icon: Contrast, min: 0.5, max: 1.5, step: 0.01, default: 1 },
    { key: "saturation", label: "Saturation", icon: Droplet, min: 0, max: 2, step: 0.01, default: 1 },
    { key: "warmth", label: "Warmth", icon: Thermometer, min: -1, max: 1, step: 0.01, default: 0 },
  ];

  return (
    <div className="px-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground spring-tap"
        >
          <Sliders className="w-3.5 h-3.5" />
          {expanded ? "Hide adjustments" : "Adjust"}
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => update("rotation", ((adjustments.rotation || 0) + 90) % 360)}
            className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground spring-tap"
          >
            <RotateCw className="w-3.5 h-3.5" /> Rotate
          </button>
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground spring-tap"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden space-y-2 pt-3"
          >
            {sliders.map((s) => {
              const Icon = s.icon;
              const val = adjustments[s.key] ?? s.default;
              return (
                <div key={s.key} className="flex items-center gap-3">
                  <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="text-[10px] font-semibold text-muted-foreground w-16 shrink-0">{s.label}</span>
                  <input
                    type="range"
                    min={s.min}
                    max={s.max}
                    step={s.step}
                    value={val}
                    onChange={(e) => update(s.key, Number(e.target.value))}
                    className="flex-1 h-1 accent-primary"
                  />
                  <span className="text-[10px] font-semibold text-foreground tabular-nums w-8 text-right">
                    {s.key === "warmth" ? (val > 0 ? `+${Math.round(val * 100)}` : Math.round(val * 100)) : Math.round(val * 100)}
                  </span>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}