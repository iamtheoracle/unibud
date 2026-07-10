import React from "react";
import { motion } from "framer-motion";
import UnibudMark from "@/components/brand/UnibudMark";

/**
 * Premium loading screen shown briefly on launch.
 * Pulsing brand mark + animated progress bar, then fades out.
 */
export default function WelcomeLoader() {
  return (
    <motion.div
      key="loader"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex-1 flex flex-col items-center justify-center relative z-10"
    >
      <motion.div
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
      >
        <UnibudMark className="w-16 h-16 text-primary" />
      </motion.div>

      {/* Thin progress bar */}
      <div className="w-32 h-[3px] rounded-full bg-muted mt-8 overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </motion.div>
  );
}