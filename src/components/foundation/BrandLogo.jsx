import React from "react";
import { Image } from "@/components/ui/image";
import { OFFICIAL_FAVICON_URL } from "@/lib/brandAssets";

/**
 * BrandLogo — the official UNIBUD mountain mark (gold on black, canonical)
 * paired with the "UNIBUD" wordmark rendered as crisp text.
 *
 * Uses OFFICIAL_FAVICON_URL (mountain mark only — no embedded wordmark),
 * so there is never a duplicated wordmark. The official asset is never
 * recolored or reinterpreted.
 */
export default function BrandLogo({ size = "md", showWord = true, className = "" }) {
  const dims = {
    sm: { mark: "w-9 h-9", radius: "rounded-[10px]", text: "text-[17px]", gap: "gap-2.5" },
    md: { mark: "w-12 h-12", radius: "rounded-[14px]", text: "text-[22px]", gap: "gap-3" },
    lg: { mark: "w-16 h-16", radius: "rounded-[18px]", text: "text-[28px]", gap: "gap-3.5" },
  }[size] || { mark: "w-12 h-12", radius: "rounded-[14px]", text: "text-[22px]", gap: "gap-3" };

  return (
    <div className={`flex items-center justify-center ${dims.gap} ${className}`}>
      <div className={`${dims.mark} ${dims.radius} overflow-hidden flex-shrink-0 soft-shadow`}>
        <Image
          src={OFFICIAL_FAVICON_URL}
          alt="UNIBUD"
          fittingType="fill"
          className="w-full h-full object-cover"
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

/** Mark-only variant for inline / circular placements. */
export function BrandMark({ size = 40, className = "" }) {
  return (
    <div
      className={`overflow-hidden flex-shrink-0 soft-shadow ${className}`}
      style={{ width: size, height: size, borderRadius: size * 0.22 }}
    >
      <Image
        src={OFFICIAL_FAVICON_URL}
        alt="UNIBUD"
        fittingType="fill"
        className="w-full h-full object-cover"
      />
    </div>
  );
}