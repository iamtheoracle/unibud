import React from "react";
import { Image } from "@/components/ui/image";
import { OFFICIAL_APP_ICON_URL } from "@/lib/brandAssets";

/**
 * BrandLogo — UNIBUD mountain mark in a Liquid Glass vessel,
 * with the "UNIBUD" wordmark in white. The single canonical brand
 * asset; never recolored. iPhone-first, scales gracefully.
 */
export default function BrandLogo({ size = "md", showWord = true, className = "" }) {
  const dims = {
    sm: { box: "w-12 h-12", radius: "rounded-[16px]", text: "text-[15px]", gap: "gap-2.5" },
    md: { box: "w-16 h-16", radius: "rounded-[20px]", text: "text-[20px]", gap: "gap-3" },
    lg: { box: "w-24 h-24", radius: "rounded-[28px]", text: "text-[30px]", gap: "gap-4" },
  }[size] || { box: "w-16 h-16", radius: "rounded-[20px]", text: "text-[20px]", gap: "gap-3" };

  return (
    <div className={`flex items-center justify-center ${dims.gap} ${className}`}>
      <div className={`${dims.box} ${dims.radius} glass-strong overflow-hidden flex items-center justify-center relative`}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 60% at 50% 40%, rgba(127,216,255,0.10), transparent 70%)" }} />
        <Image
          src={OFFICIAL_APP_ICON_URL}
          alt="UNIBUD"
          fittingType="fill"
          className="relative z-10 w-full h-full object-cover"
        />
      </div>
      {showWord && (
        <span className={`font-heading font-bold tracking-tight text-foreground ${dims.text}`}>
          UNIBUD
        </span>
      )}
    </div>
  );
}