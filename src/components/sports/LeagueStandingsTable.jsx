import React from "react";
import { motion } from "framer-motion";
import { Trophy, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { EASE } from "@/lib/motion/motionPresets";

/**
 * LeagueStandingsTable — premium league standings table.
 *
 * Props:
 *  - standings: { rank, team: { name, logo_url, color }, played, won, drawn, lost, goals_for, goals_against, points, form: ["W"|"D"|"L"] }[]
 *  - highlightTeamId: string — highlights the user's team
 *  - compact: boolean — fewer columns
 */
export default function LeagueStandingsTable({ standings = [], highlightTeamId, compact = false }) {
  if (!standings.length) {
    return (
      <div className="py-8 text-center">
        <p className="text-[12px] text-muted-foreground">No standings available</p>
        <p className="text-[10px] text-muted-foreground/60 mt-1">League standings will appear here when the season begins</p>
      </div>
    );
  }

  const FormIcon = ({ result }) => {
    const config = {
      W: { color: "bg-success", text: "W" },
      D: { color: "bg-muted-foreground", text: "D" },
      L: { color: "bg-destructive", text: "L" },
    };
    const c = config[result] || config.D;
    return (
      <span className={cn("w-4 h-4 rounded-full text-[8px] font-bold text-white flex items-center justify-center", c.color)}>
        {c.text}
      </span>
    );
  };

  const TrendIcon = ({ rank }) => {
    if (rank > 0) return <TrendingUp className="w-2.5 h-2.5 text-success" strokeWidth={2.5} />;
    if (rank < 0) return <TrendingDown className="w-2.5 h-2.5 text-destructive" strokeWidth={2.5} />;
    return <Minus className="w-2.5 h-2.5 text-muted-foreground" strokeWidth={2.5} />;
  };

  return (
    <div className="crystal-card rounded-[16px] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-border/30">
        <span className="w-5 text-center text-[9px] font-bold text-muted-foreground">#</span>
        <span className="flex-1 text-[9px] font-bold text-muted-foreground">Team</span>
        {!compact && <span className="w-6 text-center text-[9px] font-bold text-muted-foreground">P</span>}
        {!compact && <span className="w-6 text-center text-[9px] font-bold text-muted-foreground hidden xs:flex">GD</span>}
        <span className="w-8 text-center text-[9px] font-bold text-muted-foreground">PTS</span>
        {!compact && <span className="w-12 text-center text-[9px] font-bold text-muted-foreground">Form</span>}
      </div>

      {/* Rows */}
      <div className="divide-y divide-border/20">
        {standings.map((row, i) => {
          const isHighlight = highlightTeamId && row.team?.id === highlightTeamId;
          const gd = (row.goals_for || 0) - (row.goals_against || 0);

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3, ease: EASE }}
              className={cn(
                "flex items-center gap-1 px-3 py-2",
                isHighlight && "bg-primary/8"
              )}
            >
              {/* Rank */}
              <div className="w-5 flex items-center justify-center gap-0.5">
                {i < 3 && <Trophy className={cn("w-2.5 h-2.5", i === 0 ? "text-gold" : "text-muted-foreground")} strokeWidth={2.5} />}
                <span className="text-[11px] font-bold tabular-nums text-foreground">{row.rank || i + 1}</span>
              </div>

              {/* Team */}
              <div className="flex-1 flex items-center gap-2 min-w-0">
                {row.team?.logo_url && (
                  <img src={row.team.logo_url} alt="" className="w-5 h-5 object-contain flex-shrink-0" loading="lazy" />
                )}
                {row.team?.color && !row.team?.logo_url && (
                  <div className="w-5 h-5 rounded-full flex-shrink-0" style={{ background: row.team.color }} />
                )}
                <span className={cn("text-[11px] truncate", isHighlight ? "font-bold text-foreground" : "font-medium text-foreground")}>
                  {row.team?.name || "Unknown"}
                </span>
              </div>

              {/* Played */}
              {!compact && <span className="w-6 text-center text-[10px] tabular-nums text-muted-foreground">{row.played || 0}</span>}

              {/* GD */}
              {!compact && (
                <span className={cn("w-6 text-center text-[10px] tabular-nums hidden xs:block", gd > 0 ? "text-success" : gd < 0 ? "text-destructive" : "text-muted-foreground")}>
                  {gd > 0 ? "+" : ""}{gd}
                </span>
              )}

              {/* Points */}
              <span className="w-8 text-center text-[12px] font-extrabold tabular-nums text-foreground">{row.points || 0}</span>

              {/* Form */}
              {!compact && (
                <div className="w-12 flex items-center justify-center gap-0.5">
                  {row.form?.slice(-3).map((result, j) => (
                    <FormIcon key={j} result={result} />
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}