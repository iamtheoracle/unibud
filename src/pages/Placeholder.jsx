import React from "react";
import { motion } from "framer-motion";
import SparkField from "@/components/foundation/SparkField";

const EASE = [0.16, 1, 0.3, 1];

/**
 * Placeholder — calm "coming in a future milestone" screen for
 * Quad, Connect, and Me tabs.
 */
export default function Placeholder({ title, description, icon: Icon }) {
  return (
    <div className="min-h-screen w-full relative overflow-hidden flex flex-col items-center justify-center px-8">
      <SparkField count={12} />
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="relative z-10 text-center"
      >
        {Icon && (
          <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center mx-auto mb-5">
            <Icon className="w-8 h-8 text-primary" />
          </div>
        )}
        <h1 className="font-heading font-bold text-[24px] text-foreground">{title}</h1>
        <p className="text-[14px] text-muted-foreground mt-2 max-w-[280px] mx-auto leading-relaxed">{description}</p>
        <p className="text-[10px] text-muted-foreground/60 mt-5 tracking-widest uppercase">Coming in a future milestone</p>
      </motion.div>
    </div>
  );
}