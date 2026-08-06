import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const SHAPES = {
  text: "h-3",
  textSm: "h-2.5",
  textLg: "h-4",
  circle: "rounded-full",
  rect: "rounded-[12px]",
  pill: "rounded-full",
};

/**
 * PremiumSkeleton — shimmering placeholder for progressive loading.
 *
 * Props:
 *  - shape: "text" | "textSm" | "textLg" | "circle" | "rect" | "pill"
 *  - width: CSS width (number = px, string = CSS)
 *  - height: CSS height (number = px, string = CSS)
 *  - className: extra classes
 */
export function PremiumSkeleton({ shape = "text", width, height, className = "" }) {
  return (
    <div
      className={cn("shimmer bg-muted/50", SHAPES[shape] || SHAPES.text, className)}
      style={{ width, height }}
    />
  );
}

/**
 * PremiumSkeletonCard — full card skeleton for list/grid loading.
 * Mimics PremiumCard structure: cover → header → body lines → footer.
 */
export function PremiumSkeletonCard({ hasCover = true, lines = 3 }) {
  return (
    <div className="crystal-card rounded-[20px] overflow-hidden p-0">
      {hasCover && (
        <div className="aspect-video w-full shimmer bg-muted/40" />
      )}
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <PremiumSkeleton shape="circle" width={40} height={40} />
          <div className="flex-1 space-y-2">
            <PremiumSkeleton shape="text" width="70%" />
            <PremiumSkeleton shape="textSm" width="45%" />
          </div>
        </div>
        <div className="space-y-2.5">
          {Array.from({ length: lines }).map((_, i) => (
            <PremiumSkeleton key={i} shape="textSm" width={i === lines - 1 ? "60%" : "100%"} />
          ))}
        </div>
        <div className="flex gap-2 mt-4">
          <PremiumSkeleton shape="circle" width={32} height={32} />
          <PremiumSkeleton shape="circle" width={32} height={32} />
          <PremiumSkeleton shape="circle" width={32} height={32} />
        </div>
      </div>
    </div>
  );
}

/**
 * PremiumSkeletonList — a vertical list of skeleton rows.
 */
export function PremiumSkeletonList({ count = 4 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, duration: 0.3 }}
          className="glass rounded-[16px] p-3.5 flex items-center gap-3"
        >
          <PremiumSkeleton shape="circle" width={44} height={44} />
          <div className="flex-1 space-y-2">
            <PremiumSkeleton shape="text" width="60%" />
            <PremiumSkeleton shape="textSm" width="35%" />
          </div>
          <PremiumSkeleton shape="pill" width={48} height={24} />
        </motion.div>
      ))}
    </div>
  );
}

/**
 * PremiumSkeletonDetail — hero + content skeleton for detail pages.
 */
export function PremiumSkeletonDetail() {
  return (
    <div>
      <div className="aspect-[3/2] w-full shimmer bg-muted/40" />
      <div className="p-5 -mt-8 relative z-10">
        <div className="flex items-end gap-3 mb-4">
          <PremiumSkeleton shape="circle" width={72} height={72} />
          <div className="flex-1 space-y-2 pb-1">
            <PremiumSkeleton shape="textLg" width="50%" />
            <PremiumSkeleton shape="textSm" width="35%" />
          </div>
        </div>
        <div className="space-y-2.5 mb-4">
          <PremiumSkeleton shape="text" width="100%" />
          <PremiumSkeleton shape="text" width="90%" />
          <PremiumSkeleton shape="text" width="65%" />
        </div>
        <div className="flex gap-2 mb-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <PremiumSkeleton key={i} shape="pill" width={64} height={28} />
          ))}
        </div>
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <PremiumSkeleton key={i} shape="pill" width={56} height={32} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default PremiumSkeletonCard;