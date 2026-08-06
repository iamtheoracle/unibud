import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Goal, Square, ArrowLeftRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { EASE } from "@/lib/motion/motionPresets";

const EVENT_CONFIG = {
  goal: { icon: Goal, color: "text-success", bg: "bg-success/15", label: "Goal" },
  yellow_card: { icon: Square, color: "text-warning", bg: "bg-warning/15", label: "Yellow Card" },
  red_card: { icon: Square, color: "text-destructive", bg: "bg-destructive/15", label: "Red Card" },
  substitution: { icon: ArrowLeftRight, color: "text-information", bg: "bg-information/15", label: "Substitution" },
};

/**
 * MatchTimeline — animated vertical match timeline with goals, cards, and substitutions.
 *
 * Props:
 *  - events: { minute, type: "goal"|"yellow_card"|"red_card"|"substitution", team: "home"|"away", player, detail }[]
 *  - homeTeam: { name, logo_url, color }
 *  - awayTeam: { name, logo_url, color }
 *  - currentMinute: number — highlights the current play position
 */
export default function MatchTimeline({ events = [], homeTeam, awayTeam, currentMinute }) {
  if (!events.length) {
    return (
      <div className="py-8 text-center">
        <p className="text-[12px] text-muted-foreground">No events yet</p>
        <p className="text-[10px] text-muted-foreground/60 mt-1">Match events will appear here</p>
      </div>
    );
  }

  const sorted = [...events].sort((a, b) => a.minute - b.minute);

  return (
    <div className="relative">
      {/* Timeline axis */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border/50 -translate-x-1/2" />

      <div className="space-y-3">
        <AnimatePresence>
          {sorted.map((event, i) => {
            const config = EVENT_CONFIG[event.type] || EVENT_CONFIG.goal;
            const Icon = config.icon;
            const isHome = event.team === "home";

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: isHome ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08, duration: 0.4, ease: EASE }}
                className={cn("relative flex items-center gap-3", isHome ? "flex-row" : "flex-row-reverse")}
              >
                {/* Home side */}
                <div className={cn("flex-1", isHome ? "text-right" : "text-left")}>
                  {isHome && (
                    <div className="inline-flex flex-col items-end gap-0.5">
                      <span className="text-[12px] font-bold text-foreground">{event.player}</span>
                      <span className="text-[10px] text-muted-foreground">{config.label}{event.detail ? ` · ${event.detail}` : ""}</span>
                    </div>
                  )}
                </div>

                {/* Center icon */}
                <div className="relative z-10 flex items-center justify-center">
                  <div className={cn("w-7 h-7 rounded-full flex items-center justify-center crystal-dock", config.bg)}>
                    <Icon className={cn("w-3.5 h-3.5", config.color)} strokeWidth={2.5} fill={event.type === "goal" ? "currentColor" : "none"} />
                  </div>
                </div>

                {/* Away side */}
                <div className={cn("flex-1", isHome ? "text-left" : "text-right")}>
                  {!isHome && (
                    <div className="inline-flex flex-col items-start gap-0.5">
                      <span className="text-[12px] font-bold text-foreground">{event.player}</span>
                      <span className="text-[10px] text-muted-foreground">{config.label}{event.detail ? ` · ${event.detail}` : ""}</span>
                    </div>
                  )}
                </div>

                {/* Minute */}
                <div className="absolute -top-1.5 right-0">
                  <span className="text-[9px] font-bold tabular-nums text-muted-foreground bg-card px-1.5 py-0.5 rounded-full">
                    {event.minute}'
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Current position indicator */}
        {currentMinute && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative flex items-center justify-center"
          >
            <div className="w-2 h-2 rounded-full bg-primary live-pulse" />
            <span className="ml-2 text-[10px] font-bold text-primary">{currentMinute}'</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}