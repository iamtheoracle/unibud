import React from "react";
import { motion } from "framer-motion";
import { Image } from "@/components/ui/image";
import { cn } from "@/lib/utils";

const SIZES = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
  "2xl": 112,
};

const RING_VARIANTS = {
  none: "",
  story: "ring-2 ring-primary/40 ring-offset-2 ring-offset-background",
  verified: "ring-1 ring-border",
  highlight: "ring-2 ring-gold/50 ring-offset-2 ring-offset-background",
};

/**
 * PremiumAvatar — unified avatar with optional story ring,
 * online status, and verification badge.
 *
 * Props:
 *  - src: image URL
 *  - alt: label
 *  - size: "xs" | "sm" | "md" | "lg" | "xl" | "2xl"
 *  - ring: "none" | "story" | "verified" | "highlight"
 *  - online: boolean — show green status dot
 *  - verified: boolean — show verified checkmark
 *  - onClick: tap handler
 *  - className: extra classes
 */
export default function PremiumAvatar({
  src,
  alt = "",
  size = "md",
  ring = "none",
  online = false,
  verified = false,
  onClick,
  className = "",
}) {
  const px = SIZES[size] || SIZES.md;
  const dotSize = Math.max(8, Math.round(px * 0.28));
  const badgeSize = Math.max(14, Math.round(px * 0.42));

  return (
    <motion.div
      whileTap={onClick ? { scale: 0.92 } : undefined}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={cn("relative inline-block flex-shrink-0", onClick ? "cursor-pointer" : "", className)}
      onClick={onClick}
    >
      <div
        className={cn(
          "rounded-full overflow-hidden bg-muted flex items-center justify-center",
          RING_VARIANTS[ring] || RING_VARIANTS.none,
        )}
        style={{ width: px, height: px }}
      >
        {src ? (
          <Image src={src} alt={alt} fittingType="fill" className="w-full h-full" />
        ) : (
          <span className="font-heading font-bold text-muted-foreground" style={{ fontSize: px * 0.4 }}>
            {(alt || "?").charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      {/* Online status */}
      {online && (
        <span
          className="absolute bottom-0 right-0 rounded-full bg-success border-2 border-background"
          style={{ width: dotSize, height: dotSize }}
        />
      )}

      {/* Verified badge */}
      {verified && (
        <span
          className="absolute -bottom-0.5 -right-0.5 rounded-full bg-primary flex items-center justify-center border-2 border-background"
          style={{ width: badgeSize, height: badgeSize }}
        >
          <svg className="text-primary-foreground" style={{ width: badgeSize * 0.6, height: badgeSize * 0.6 }} viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          </svg>
        </span>
      )}
    </motion.div>
  );
}