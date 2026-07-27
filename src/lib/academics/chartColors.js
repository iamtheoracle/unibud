import { useEffect, useState } from "react";

const DEFAULTS = {
  primary: "#0B1F4D",
  accent: "#2563EB",
  success: "#14B8A6",
  warning: "#F59E0B",
  muted: "#94A3B8",
  foreground: "#0F172A",
  border: "#E2E8F0",
  chart: ["#2563EB", "#0B1F4D", "#14B8A6", "#F59E0B", "#94A3B8"],
};

/** Resolves design tokens to concrete hsl() strings, and re-reads on theme toggle. */
export function useChartTheme() {
  const [colors, setColors] = useState(DEFAULTS);
  useEffect(() => {
    const read = () => {
      const s = getComputedStyle(document.documentElement);
      const g = (v) => s.getPropertyValue(v).trim();
      const wrap = (v, fallback) => (g(v) ? `hsl(${g(v)})` : fallback);
      const primary = wrap("--primary", DEFAULTS.primary);
      const accent = wrap("--accent", DEFAULTS.accent);
      const success = wrap("--success", DEFAULTS.success);
      const warning = wrap("--warning", DEFAULTS.warning);
      const muted = wrap("--muted-foreground", DEFAULTS.muted);
      setColors({
        primary,
        accent,
        success,
        warning,
        muted,
        foreground: wrap("--foreground", DEFAULTS.foreground),
        border: wrap("--border", DEFAULTS.border),
        chart: [accent, primary, success, warning, muted],
      });
    };
    read();
    const obs = new MutationObserver(read);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style"] });
    return () => obs.disconnect();
  }, []);
  return colors;
}

/** Recharts tooltip style — inline style resolves CSS variables (SVG attributes do not). */
export function tooltipStyle() {
  return {
    background: "hsl(var(--popover))",
    color: "hsl(var(--popover-foreground))",
    border: "1px solid hsl(var(--border))",
    borderRadius: 12,
    fontSize: 12,
    boxShadow: "var(--shadow-soft)",
  };
}