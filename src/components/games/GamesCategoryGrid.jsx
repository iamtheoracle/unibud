import React from "react";
import { motion } from "framer-motion";
import { GAME_TYPES } from "./gamesConstants";
import { hapticTap } from "@/lib/haptics";

const EASE = [0.16, 1, 0.3, 1];

/**
 * GamesCategoryGrid — grid of game type tiles for browsing.
 * Selecting a tile filters the active rooms list.
 */
export default function GamesCategoryGrid({ selected, onSelect }) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {GAME_TYPES.slice(0, 12).map((type, i) => {
        const Icon = type.Icon;
        const active = selected === type.id;
        return (
          <motion.button
            key={type.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03, duration: 0.3, ease: EASE }}
            onClick={() => { hapticTap(); onSelect(active ? null : type.id); }}
            className={`flex flex-col items-center gap-1.5 p-2.5 rounded-[16px] spring-tap transition-all ${
              active ? "glass-strong" : "glass"
            }`}
          >
            <div className={`w-9 h-9 rounded-full grid place-items-center ${active ? "bg-foreground" : "bg-muted/40"}`}>
              <Icon className={`w-4 h-4 ${active ? "text-background" : "text-foreground/70"}`} strokeWidth={1.8} />
            </div>
            <span className={`text-[9px] font-semibold leading-tight text-center ${active ? "text-foreground" : "text-muted-foreground"}`}>
              {type.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}