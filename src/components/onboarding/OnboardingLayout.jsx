import React from "react";
import { motion } from "framer-motion";
import UnibudMark from "@/components/brand/UnibudMark";

export default function OnboardingLayout({ step, totalSteps, stepLabel, children, footer }) {
  const progress = (step / totalSteps) * 100;
  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <motion.div
        className="absolute top-[-15%] left-[-10%] w-[70%] h-[35%] rounded-full bg-primary/[0.05] blur-[100px] pointer-events-none"
        animate={{ x: [0, 40, 0], y: [0, 20, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="flex-shrink-0 px-6 pt-8 pb-2 relative z-10">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-black flex items-center justify-center">
            <UnibudMark className="w-4 h-4 text-primary" />
          </div>
          <span className="font-heading font-extrabold text-[15px] text-foreground">UNIBUD</span>
        </div>
        <div className="max-w-[180px] mx-auto">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-semibold text-muted-foreground">{stepLabel}</span>
            <span className="text-[10px] font-semibold text-muted-foreground">{step}/{totalSteps}</span>
          </div>
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <motion.div className="h-full bg-primary rounded-full" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.5, ease: "easeOut" }} />
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-6 pb-4 relative z-10 no-scrollbar">{children}</div>
      {footer && (
        <div className="flex-shrink-0 px-6 pb-6 pt-3 relative z-10 bg-gradient-to-t from-background via-background/95 to-transparent">
          <div className="space-y-2">{footer}</div>
        </div>
      )}
    </div>
  );
}