import React from "react";
import UnibudMark from "./UnibudMark";

/**
 * Official UNIBUD app icon: gold mountain mark inside a black rounded-square container.
 * Use the rounded variant everywhere. Do not regenerate another icon.
 */
const CONFIG = {
  sm: { container: "w-9 h-9 rounded-[12px]", mark: "w-5 h-5" },
  md: { container: "w-12 h-12 rounded-[16px]", mark: "w-6 h-6" },
  lg: { container: "w-16 h-16 rounded-[22px]", mark: "w-8 h-8" },
  xl: { container: "w-20 h-20 rounded-[28px]", mark: "w-10 h-10" },
  "2xl": { container: "w-24 h-24 rounded-[32px]", mark: "w-12 h-12" },
};

export default function UnibudIcon({
  size = "md",
  rounded = true,
  glow = false,
  className = "",
}) {
  const c = CONFIG[size] || CONFIG.md;
  const radiusClass = rounded ? "" : "rounded-none";

  return (
    <div
      className={`${c.container} bg-black flex items-center justify-center ${
        glow ? "gold-glow" : "premium-shadow"
      } ${radiusClass} ${className}`}
    >
      <UnibudMark className={`${c.mark} text-primary`} />
    </div>
  );
}