import React from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Wifi, Users } from "lucide-react";

export default function LiveClassHeader({ elapsed, recording, onBack }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 pb-2">
      <button onClick={onBack} className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-foreground hover:bg-muted/70 transition-colors">
        <ChevronLeft className="w-5 h-5" />
      </button>

      <div className="flex-1 min-w-0">
        <h1 className="font-heading font-bold text-[15px] text-foreground truncate">CSC 302 · Data Structures</h1>
        <p className="text-[11px] text-muted-foreground truncate">Dr. Sarah Okonkwo · University of Benin</p>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="flex items-center gap-1">
          <Wifi className="w-4 h-4 text-success" />
        </div>

        {recording && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-destructive/10">
            <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-destructive" />
            <span className="text-[9px] font-bold text-destructive">REC</span>
          </div>
        )}

        <span className="text-[11px] font-semibold text-muted-foreground tabular-nums">{elapsed}</span>

        <div className="flex items-center gap-1">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span className="text-[11px] font-semibold text-muted-foreground">6</span>
        </div>
      </div>
    </div>
  );
}