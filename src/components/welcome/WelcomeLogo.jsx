import React from "react";
import { motion } from "framer-motion";
import UnibudMark from "@/components/brand/UnibudMark";
import { OFFICIAL_FULL_LOGO_URL } from "@/lib/brandAssets";

/**
 * UNIBUD logo lockup for the Welcome screen.
 *
 * Renders the official mountain mark + "UNIBUD" wordmark + tagline
 * "The Future Starts Together." The `tone` prop automatically switches between
 * a black and a white version so the logo stays readable over any background:
 *
 *   tone="white" → pure white lockup (for dark / cinematic backgrounds)
 *   tone="black" → near-black lockup (for light backgrounds)
 *
 * A thin UNIBUD Gold line sits beneath the tagline as a premium accent — the
 * only place gold is used on the Welcome screen.
 *
 * To use an uploaded official logo image instead, set OFFICIAL_LOGO_URL below
 * to the uploaded asset and it will render in place of the vector lockup.
 */
const GOLD = "#C9A24B";

// Official uploaded logo image (full lockup: mountain + UNIBUD + tagline).
const OFFICIAL_LOGO_URL = OFFICIAL_FULL_LOGO_URL;

const TONE = {
  white: { color: "#ffffff", sub: "rgba(255,255,255,0.72)" },
  black: { color: "#0E1111", sub: "rgba(14,17,17,0.62)" },
};

export default function WelcomeLogo({ tone = "white", size = "xl", className = "" }) {
  const t = TONE[tone] || TONE.white;

  // Image-based official logo (when provided).
  if (OFFICIAL_LOGO_URL) {
    return (
      <motion.img
        src={OFFICIAL_LOGO_URL}
        alt="UNIBUD — The Future Starts Together"
        className={`w-[190px] md:w-[220px] h-auto select-none ${className}`}
        draggable={false}
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      />
    );
  }

  // Vector lockup — crisp at any resolution, supports auto B&W.
  return (
    <motion.div
      className={`flex flex-col items-center ${className}`}
      initial={{ opacity: 0, scale: 0.94, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
    >
      <span style={{ color: t.color }} className="inline-flex">
        <UnibudMark className="w-12 h-12 md:w-14 md:h-14" />
      </span>
      <span
        className="font-heading font-extrabold tracking-[0.14em] leading-none mt-3 text-[30px] md:text-[34px]"
        style={{ color: t.color, letterSpacing: "0.14em" }}
      >
        UNIBUD
      </span>
      <span
        className="font-heading font-medium tracking-[0.22em] uppercase mt-2 text-[9px] md:text-[10px]"
        style={{ color: t.sub }}
      >
        The Future Starts Together
      </span>
      {/* Premium gold accent line */}
      <span
        className="mt-3 h-[2px] w-10 rounded-full"
        style={{ background: GOLD, boxShadow: `0 0 14px ${GOLD}66` }}
      />
    </motion.div>
  );
}