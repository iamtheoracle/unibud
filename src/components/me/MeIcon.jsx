import React from "react";

/**
 * UNIBUD OS — Premium Icon System
 *
 * Semantic colors assigned by meaning, not randomly.
 * Each icon has a dark background, colored gradient overlay,
 * glass highlight, and soft semantic glow.
 */

export const CATEGORY_COLORS = {
  bud: "#FF8A00",
  academics: "#10B981",
  social: "#3B82F6",
  professional: "#8B5CF6",
  wallet: "#FACC15",
  settings: "#9CA3AF",
  security: "#EF4444",
  media: "#EC4899",
  travel: "#06B6D4",
  health: "#14B8A6",
  developer: "#6366F1",
  business: "#F59E0B",
  creator: "#A855F7",
};

export default function MeIcon({ icon: Icon, color = "#9CA3AF", size = 32 }) {
  if (!Icon) return null;
  return (
    <div
      className="relative flex items-center justify-center rounded-[10px] flex-shrink-0"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(145deg, ${color}1C, rgba(17,17,17,0.5))`,
        border: `0.5px solid ${color}15`,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06), 0 0.5px 3px ${color}0A`,
      }}
    >
      <Icon style={{ color }} strokeWidth={2} className="w-[42%] h-[42%]" />
    </div>
  );
}