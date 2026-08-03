import React from "react";

/**
 * UNIBUD OS — Premium Icon System
 * Each icon has a colored gradient background, soft inner highlight,
 * and gentle outer glow. Category colors are consistent across the app.
 */

export const CATEGORY_COLORS = {
  bud: "#FF8A00",
  academic: "#3B82F6",
  social: "#8B5CF6",
  professional: "#10B981",
  wallet: "#FACC15",
  preferences: "#9CA3AF",
  privacy: "#EF4444",
  marketplace: "#14B8A6",
  creator: "#EC4899",
  developer: "#6366F1",
};

export default function MeIcon({ icon: Icon, color = "#9CA3AF", size = 32 }) {
  if (!Icon) return null;
  return (
    <div
      className="relative flex items-center justify-center rounded-[10px] flex-shrink-0"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${color}30, ${color}12)`,
        boxShadow: `inset 0 0.5px 0 ${color}30, 0 1px 6px ${color}12`,
      }}
    >
      <Icon style={{ color }} strokeWidth={2} className="w-[42%] h-[42%]" />
    </div>
  );
}