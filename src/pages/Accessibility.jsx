import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Eye, Zap, Type, Layers, Palette, RotateCcw, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

const CREAM = "#F7F0E8";
const CREAM_MUTED = "rgba(247, 240, 232, 0.50)";
const ORANGE = "#FF8A2A";
const EASE = [0.16, 1, 0.3, 1];

const STORAGE_KEY = "unibud_accessibility";

const DEFAULTS = {
  highContrast: false,
  reduceMotion: false,
  largeText: false,
  reduceTransparency: false,
  colorBlindMode: "none",
};

const COLOR_BLIND_MODES = [
  { value: "none", label: "None" },
  { value: "deuteranopia", label: "Deuteranopia" },
  { value: "protanopia", label: "Protanopia" },
  { value: "tritanopia", label: "Tritanopia" },
];

const FILTERS = {
  none: "none",
  deuteranopia: "url(#cb-deuteranopia)",
  protanopia: "url(#cb-protanopia)",
  tritanopia: "url(#cb-tritanopia)",
};

export default function Accessibility() {
  const { toast } = useToast();
  const [prefs, setPrefs] = React.useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return { ...DEFAULTS, ...JSON.parse(saved) };
    } catch {}
    return DEFAULTS;
  });

  React.useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("high-contrast", prefs.highContrast);
    root.classList.toggle("reduce-motion", prefs.reduceMotion);
    root.classList.toggle("ux-large-text", prefs.largeText);
    root.classList.toggle("reduce-transparency", prefs.reduceTransparency);
    root.style.filter = FILTERS[prefs.colorBlindMode] || "none";
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  }, [prefs]);

  const toggle = (key) => {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
    toast({ title: `${key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase())} ${!prefs[key] ? "on" : "off"}` });
  };

  const reset = () => {
    setPrefs(DEFAULTS);
    toast({ title: "Reset to defaults ✓" });
  };

  return (
    <div className="w-full max-w-[520px] mx-auto px-5 pt-8 pb-40 safe-area-pt">
      {/* SVG filters for color blindness simulation */}
      <svg className="absolute w-0 h-0" aria-hidden="true">
        <defs>
          <filter id="cb-deuteranopia"><feColorMatrix type="matrix" values="0.625 0.375 0 0 0 0.7 0.3 0 0 0 0 0.3 0.7 0 0 0 0 0 1 0" /></filter>
          <filter id="cb-protanopia"><feColorMatrix type="matrix" values="0.567 0.433 0 0 0 0.558 0.442 0 0 0 0 0.242 0.758 0 0 0 0 0 1 0" /></filter>
          <filter id="cb-tritanopia"><feColorMatrix type="matrix" values="0.95 0.05 0 0 0 0 0.433 0.567 0 0 0 0.475 0.525 0 0 0 0 0 1 0" /></filter>
        </defs>
      </svg>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link to="/settings" className="w-10 h-10 rounded-full grid place-items-center spring-tap" style={{ background: "rgba(44,33,26,0.6)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <ArrowLeft className="w-[18px] h-[18px]" strokeWidth={1.8} style={{ color: CREAM }} />
          </Link>
          <div>
            <h1 className="text-[24px] font-bold tracking-tight" style={{ color: CREAM }}>Accessibility</h1>
            <p className="text-[13px]" style={{ color: CREAM_MUTED }}>Customize your experience</p>
          </div>
        </div>
        <button onClick={reset} className="flex items-center gap-1.5 text-[12px] font-medium spring-tap" style={{ color: ORANGE }}>
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE }} className="flex flex-col gap-3">
        <ToggleCard icon={Eye} title="High Contrast" desc="Stronger borders and solid surfaces for better visibility" on={prefs.highContrast} onToggle={() => toggle("highContrast")} />
        <ToggleCard icon={Zap} title="Reduce Motion" desc="Disable animations and transitions" on={prefs.reduceMotion} onToggle={() => toggle("reduceMotion")} />
        <ToggleCard icon={Type} title="Large Text" desc="Increase text size by 13% across the app" on={prefs.largeText} onToggle={() => toggle("largeText")} />
        <ToggleCard icon={Layers} title="Reduce Transparency" desc="Replace glass blur with solid backgrounds" on={prefs.reduceTransparency} onToggle={() => toggle("reduceTransparency")} />

        {/* Color Blind Mode */}
        <div className="glass-card p-4 mt-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full grid place-items-center shrink-0" style={{ background: "rgba(255,138,42,0.12)" }}>
              <Palette className="w-5 h-5" style={{ color: ORANGE }} />
            </div>
            <div className="flex-1">
              <p className="text-[14px] font-semibold" style={{ color: CREAM }}>Color Blind Mode</p>
              <p className="text-[12px]" style={{ color: CREAM_MUTED }}>Adjust colors for color vision deficiency</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {COLOR_BLIND_MODES.map((mode) => (
              <button key={mode.value} onClick={() => setPrefs((p) => ({ ...p, colorBlindMode: mode.value }))} className="h-11 rounded-[12px] text-[13px] font-medium flex items-center justify-center gap-1.5 spring-tap" style={prefs.colorBlindMode === mode.value ? { background: "rgba(255,138,42,0.15)", color: ORANGE, border: "1px solid rgba(255,138,42,0.3)" } : { background: "rgba(255,255,255,0.04)", color: CREAM_MUTED, border: "1px solid transparent" }}>
                {prefs.colorBlindMode === mode.value && <Check className="w-3.5 h-3.5" />} {mode.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-[12px] mt-6 text-center" style={{ color: CREAM_MUTED }}>
        Settings are saved automatically and apply across all devices on this browser.
      </motion.p>
    </div>
  );
}

function ToggleCard({ icon: Icon, title, desc, on, onToggle }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: EASE }} className="glass-card p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-full grid place-items-center shrink-0" style={{ background: on ? "rgba(255,138,42,0.15)" : "rgba(255,255,255,0.04)" }}>
        <Icon className="w-5 h-5" style={{ color: on ? ORANGE : CREAM_MUTED }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-semibold" style={{ color: CREAM }}>{title}</p>
        <p className="text-[12px]" style={{ color: CREAM_MUTED }}>{desc}</p>
      </div>
      <button onClick={onToggle} className="relative w-12 h-7 rounded-full transition-colors duration-300 shrink-0" style={{ background: on ? ORANGE : "rgba(255,255,255,0.08)" }} role="switch" aria-checked={on}>
        <motion.span className="absolute top-0.5 w-6 h-6 rounded-full bg-white" animate={{ left: on ? 22 : 2 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} />
      </button>
    </motion.div>
  );
}