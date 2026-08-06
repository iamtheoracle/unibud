import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Crown, Medal } from "lucide-react";
import { LEADERBOARD_TIMEFRAMES } from "./gamesConstants";
import { hapticTap } from "@/lib/haptics";

const EASE = [0.16, 1, 0.3, 1];

const RANK_STYLES = [
  { icon: Crown, color: "text-gold" },
  { icon: Medal, color: "text-foreground/60" },
  { icon: Medal, color: "text-foreground/40" },
];

/**
 * LeaderboardPreview — premium leaderboard with timeframe tabs.
 * Computes rankings from completed match data (real wins only).
 */
export default function LeaderboardPreview({ entries = [] }) {
  const [timeframe, setTimeframe] = useState("all_time");

  return (
    <div className="rounded-[18px] glass-card p-3">
      {/* Timeframe tabs */}
      <div className="flex gap-1 overflow-x-auto no-scrollbar mb-3">
        {LEADERBOARD_TIMEFRAMES.map((tf) => {
          const active = timeframe === tf.id;
          return (
            <button
              key={tf.id}
              onClick={() => { hapticTap(); setTimeframe(tf.id); }}
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap spring-tap transition-all ${
                active ? "bg-foreground text-background" : "text-muted-foreground"
              }`}
            >
              {tf.label}
            </button>
          );
        })}
      </div>

      {entries.length === 0 ? (
        <div className="flex flex-col items-center text-center py-6">
          <Trophy className="w-7 h-7 text-muted-foreground/30 mb-2" strokeWidth={1.5} />
          <p className="text-[12px] font-bold text-foreground">No rankings yet</p>
          <p className="text-[10px] text-muted-foreground mt-0.5 max-w-[200px]">Play and win matches to appear on the leaderboard.</p>
        </div>
      ) : (
        <div className="space-y-1">
          <AnimatePresence mode="popLayout">
            {entries.map((entry, i) => {
              const rankStyle = RANK_STYLES[i] || null;
              const RankIcon = rankStyle?.icon;
              return (
                <motion.div
                  key={entry.user_id}
                  layout
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ duration: 0.25, ease: EASE }}
                  className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-muted/20"
                >
                  <div className="w-6 flex items-center justify-center shrink-0">
                    {RankIcon ? (
                      <RankIcon className={`w-4 h-4 ${rankStyle.color}`} strokeWidth={1.8} />
                    ) : (
                      <span className="text-[12px] font-bold text-muted-foreground">{i + 1}</span>
                    )}
                  </div>
                  <div className="w-7 h-7 rounded-full bg-muted grid place-items-center overflow-hidden shrink-0">
                    {entry.image ? (
                      <img src={entry.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] font-bold text-muted-foreground">{entry.name?.[0]?.toUpperCase()}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-foreground line-clamp-1">{entry.name}</p>
                  </div>
                  <span className="text-[13px] font-bold text-foreground tabular-nums">{entry.wins}</span>
                  <span className="text-[9px] text-muted-foreground">wins</span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}