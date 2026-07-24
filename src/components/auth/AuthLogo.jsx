import React from "react";
import { motion } from "framer-motion";
import { OFFICIAL_FULL_LOGO_URL } from "@/lib/brandAssets";

/**
 * Auth screen logo — renders the official uploaded UNIBUD lockup.
 */
export default function AuthLogo({ delay = 0, size = "md" }) {
  const width = size === "lg" ? "w-[176px]" : "w-[150px]";
  const mb = size === "lg" ? "mb-7" : "mb-6";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay }}
      className={`flex flex-col items-center ${mb}`}
    >
      <motion.img
        src={OFFICIAL_FULL_LOGO_URL}
        alt="UNIBUD — The Future Starts Together"
        className={`${width} h-auto select-none`}
        draggable={false}
      />
    </motion.div>
  );
}