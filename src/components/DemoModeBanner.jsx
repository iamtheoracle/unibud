import React from "react";
import { motion } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { useDemoMode } from "@/lib/DemoModeContext";

export default function DemoModeBanner() {
  const { isDemoMode, exitDemoMode } = useDemoMode();

  if (!isDemoMode) return null;

  return (
    <motion.div
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-0 z-[60] bg-primary/10 border-b border-primary/20 backdrop-blur-xl px-4 py-2 flex items-center justify-between"
    >
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-md bg-primary flex items-center justify-center">
          <Sparkles className="w-3 h-3 text-primary-foreground" strokeWidth={2.5} />
        </div>
        <span className="text-[12px] font-bold text-primary">Demo Mode</span>
        <span className="text-[11px] text-muted-foreground hidden sm:inline">— Sample data shown</span>
      </div>
      <button
        onClick={() => {
          exitDemoMode();
          window.location.href = "/welcome";
        }}
        className="text-[11px] font-semibold text-foreground hover:text-primary spring-tap flex items-center gap-1"
      >
        Exit <X className="w-3 h-3" />
      </button>
    </motion.div>
  );
}