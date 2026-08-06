import React from "react";
import { motion } from "framer-motion";
import { Image } from "@/components/ui/image";
import { BUD_CHARACTER_URL } from "@/lib/brandAssets";

/**
 * BudAvatar — circular Bud mascot avatar.
 *
 * Small, recognizable Bud face for chat headers, message bubbles,
 * notifications, and anywhere a compact Bud identity is needed.
 * Uses the hero face from the reference sheet, center-cropped.
 */
export default function BudAvatar({ className = "", size = 40, animate = false }) {
  const content = (
    <div
      className={`relative overflow-hidden rounded-full flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src={BUD_CHARACTER_URL}
        alt="Bud"
        fittingType="fill"
        focalPointX={0.5}
        focalPointY={0.32}
        className="w-full h-full object-cover"
      />
    </div>
  );

  if (!animate) return content;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      {content}
    </motion.div>
  );
}