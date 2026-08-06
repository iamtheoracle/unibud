import React from "react";
import { motion } from "framer-motion";
import { EASE } from "@/lib/motion/motionPresets";

/**
 * MatchStatistics — animated comparison bars for match stats.
 *
 * Props:
 *  - stats: { label, home, away, unit?: string }[]
 *  - homeColor: string (CSS color)
 *  - awayColor: string (CSS color)
 */
export default function MatchStatistics({ stats = [], homeColor = "hsl(var(--primary))", awayColor = "hsl(var(--muted-foreground))" }) {
  if (!stats.length) {
    return (
      <div className="py-8 text-center">
        <p className="text-[12px] text-muted-foreground">Statistics unavailable</p>
        <p className="text-[10px] text-muted-foreground/60 mt-1">Match stats will appear here when available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {stats.map((stat, i) => {
        const total = (stat.home || 0) + (stat.away || 0) || 1;
        const homePct = ((stat.home || 0) / total) * 100;
        const awayPct = ((stat.away || 0) / total) * 100;

        return (
          <div key={i}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[14px] font-extrabold tabular-nums text-foreground">{stat.home}{stat.unit || ""}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{stat.label}</span>
              <span className="text-[14px] font-extrabold tabular-nums text-foreground">{stat.away}{stat.unit || ""}</span>
            </div>
            <div className="flex items-center gap-1 h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${homePct}%` }}
                transition={{ delay: i * 0.1, duration: 0.6, ease: EASE }}
                className="h-full rounded-l-full"
                style={{ background: homeColor }}
              />
              <div className="w-px h-full bg-border flex-shrink-0" />
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${awayPct}%` }}
                transition={{ delay: i * 0.1, duration: 0.6, ease: EASE }}
                className="h-full rounded-r-full"
                style={{ background: awayColor }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * FormationView — displays team formation pitch view.
 *
 * Props:
 *  - formation: string (e.g. "4-3-3")
 *  - players: { name, number, position: { x, y }, rating? }[]
 *  - teamColor: CSS color
 *  - direction: "left" | "right"
 */
export function FormationView({ formation = "4-3-3", players = [], teamColor = "hsl(var(--primary))", direction = "left" }) {
  const lines = formation.split("-").map(Number);
  const totalLines = lines.length;

  return (
    <div className="relative w-full aspect-[3/4] rounded-[16px] overflow-hidden crystal-card">
      {/* Pitch background */}
      <div className="absolute inset-0 bg-gradient-to-b from-success/8 to-success/4">
        <div className="absolute inset-3 border border-white/15 rounded-[8px]" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 border border-white/15 rounded-full" />
        <div className="absolute left-0 right-0 top-1/2 h-px bg-white/15" />
      </div>

      {/* Players */}
      {players.length > 0 ? (
        players.map((player, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05, duration: 0.3, ease: EASE }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${(player.position?.x || 50)}%`, top: `${(player.position?.y || 50)}%` }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px] text-white shadow-lg"
              style={{ background: teamColor }}
            >
              {player.number || ""}
            </div>
            <p className="text-[8px] text-white font-medium mt-0.5 text-center max-w-[60px] truncate">
              {player.name || ""}
            </p>
            {player.rating && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gold text-[8px] font-bold text-white flex items-center justify-center">
                {player.rating}
              </span>
            )}
          </motion.div>
        ))
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-[11px] text-muted-foreground">Lineup will appear here</p>
        </div>
      )}
    </div>
  );
}

/**
 * MatchScoreboard — live scoreboard with team logos and score.
 *
 * Props:
 *  - homeTeam: { name, logo_url, color }
 *  - awayTeam: { name, logo_url, color }
 *  - homeScore, awayScore: number
 *  - minute: number | "HT" | "FT"
 *  - status: "live" | "upcoming" | "finished"
 *  - competition: string
 */
export function MatchScoreboard({ homeTeam, awayTeam, homeScore = 0, awayScore = 0, minute, status = "upcoming", competition }) {
  return (
    <div className="crystal-card rounded-[20px] p-5">
      {competition && (
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center mb-3">{competition}</p>
      )}
      <div className="flex items-center justify-between gap-3">
        {/* Home */}
        <div className="flex-1 flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full glass-strong flex items-center justify-center overflow-hidden">
            {homeTeam?.logo_url ? (
              <img src={homeTeam.logo_url} alt={homeTeam.name} className="w-8 h-8 object-contain" loading="lazy" />
            ) : (
              <span className="text-[14px] font-bold text-foreground">{homeTeam?.name?.charAt(0) || "?"}</span>
            )}
          </div>
          <span className="text-[11px] font-bold text-foreground text-center truncate max-w-[80px]">{homeTeam?.name || "Home"}</span>
        </div>

        {/* Score */}
        <div className="flex items-center gap-2">
          <span className="font-display font-extrabold text-[28px] tabular-nums text-foreground">{homeScore}</span>
          <span className="text-[16px] text-muted-foreground font-bold">-</span>
          <span className="font-display font-extrabold text-[28px] tabular-nums text-foreground">{awayScore}</span>
        </div>

        {/* Away */}
        <div className="flex-1 flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full glass-strong flex items-center justify-center overflow-hidden">
            {awayTeam?.logo_url ? (
              <img src={awayTeam.logo_url} alt={awayTeam.name} className="w-8 h-8 object-contain" loading="lazy" />
            ) : (
              <span className="text-[14px] font-bold text-foreground">{awayTeam?.name?.charAt(0) || "?"}</span>
            )}
          </div>
          <span className="text-[11px] font-bold text-foreground text-center truncate max-w-[80px]">{awayTeam?.name || "Away"}</span>
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center justify-center mt-3">
        {status === "live" && minute && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-destructive/15">
            <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.6, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-destructive" />
            <span className="text-[10px] font-bold text-destructive">{typeof minute === "number" ? `${minute}'` : minute}</span>
          </div>
        )}
        {status === "upcoming" && (
          <span className="text-[10px] font-bold text-muted-foreground">{minute || "Scheduled"}</span>
        )}
        {status === "finished" && (
          <span className="text-[10px] font-bold text-muted-foreground">Full Time</span>
        )}
      </div>
    </div>
  );
}