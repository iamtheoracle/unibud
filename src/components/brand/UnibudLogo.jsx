import React from "react";
import UnibudMark from "./UnibudMark";

/**
 * Official UNIBUD logo lockup: mountain mark + "UNIVERSITY BUDDY" + "UNIBUD".
 *
 * Variants:
 *   light — black on light backgrounds
 *   dark  — white on dark backgrounds
 *   gold  — gold mark + gold-gradient "UNIBUD" for premium / splash
 *
 * Do not recreate, reinterpret, or modify proportions.
 */
const SIZES = {
  sm: { mark: "w-5 h-5", sub: "text-[8px]", main: "text-[16px]", line: "w-8", mt: "mt-1.5" },
  md: { mark: "w-8 h-8", sub: "text-[9px]", main: "text-[22px]", line: "w-12", mt: "mt-2" },
  lg: { mark: "w-11 h-11", sub: "text-[10px]", main: "text-[28px]", line: "w-14", mt: "mt-2" },
  xl: { mark: "w-14 h-14", sub: "text-[12px]", main: "text-[34px]", line: "w-20", mt: "mt-2.5" },
};

const VARIANTS = {
  light: { mark: "text-foreground", sub: "text-muted-foreground", main: "text-foreground", gradient: false },
  dark: { mark: "text-white", sub: "text-white/50", main: "text-white", gradient: false },
  gold: { mark: "text-primary", sub: "text-muted-foreground", main: "", gradient: true },
};

export default function UnibudLogo({
  variant = "light",
  size = "md",
  showLine = false,
  className = "",
}) {
  const s = SIZES[size] || SIZES.md;
  const v = VARIANTS[variant] || VARIANTS.light;

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <UnibudMark className={`${s.mark} ${v.mark}`} />
      <span className={`${s.sub} font-heading font-medium tracking-[0.18em] uppercase ${v.sub} ${s.mt}`}>
        University Buddy
      </span>
      <span
        className={`${s.main} font-heading font-extrabold tracking-tight leading-none ${
          v.gradient ? "text-gold-gradient" : v.main
        }`}
      >
        UNIBUD
      </span>
      {showLine && <div className={`${s.line} h-px bg-primary mt-2.5`} />}
    </div>
  );
}