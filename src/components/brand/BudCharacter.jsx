import React from "react";
import { motion } from "framer-motion";
import { Image } from "@/components/ui/image";
import { BUD_CHARACTER_URL } from "@/lib/brandAssets";

/**
 * BudCharacter — the official UNIBUD mascot portrait.
 *
 * Bud is the visible personality of Spark. He is the permanent, exclusive
 * AI academic companion — never a robot, never a generic assistant.
 *
 * Variants:
 *   "portrait" — center-cropped hero portrait (default, for chat welcome / headers)
 *   "full"     — the complete character sheet (for posters / about screens)
 *
 * The portrait variant crops into the centered hero on the reference sheet,
 * framed in premium Liquid Glass with a soft ambient glow.
 */
export default function BudCharacter({
  variant = "portrait",
  className = "",
  animate = true,
  glow = true,
}) {
  const isFull = variant === "full";

  const content = (
    <div className={`relative overflow-hidden ${className}`}>
      {glow && (
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 50% 30%, hsl(0 0% 100% / 0.10), transparent 70%)",
          }}
        />
      )}
      <Image
        src={BUD_CHARACTER_URL}
        alt="Bud — UNIBUD AI Academic Companion"
        fittingType={isFull ? "fit" : "fill"}
        focalPointX={0.5}
        focalPointY={0.42}
        className="relative z-10 w-full h-full object-cover"
      />
    </div>
  );

  if (!animate) return content;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {content}
    </motion.div>
  );
}