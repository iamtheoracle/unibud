import React from "react";
import { motion } from "framer-motion";
import { Trophy, Calendar, Users } from "lucide-react";
import { getGameType, TOURNAMENT_STATUS } from "./gamesConstants";

const EASE = [0.16, 1, 0.3, 1];

/**
 * TournamentCard — displays a campus tournament with status and registration.
 */
export default function TournamentCard({ tournament }) {
  const gameType = getGameType(tournament.game_type);
  const Icon = gameType.Icon;
  const status = TOURNAMENT_STATUS[tournament.status] || TOURNAMENT_STATUS.registration;
  const participants = tournament.participants || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: EASE }}
      className="p-3 rounded-[18px] glass-card"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl grid place-items-center bg-gold/10 shrink-0">
          <Icon className="w-5 h-5 text-gold" strokeWidth={1.6} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-foreground line-clamp-1">{tournament.title}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] text-muted-foreground">{gameType.label}</span>
            <span className={`text-[9px] font-bold ${status.color}`}>· {status.label}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-2.5">
        <div className="flex items-center gap-1">
          <Users className="w-3 h-3 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground">{participants.length}{tournament.max_participants ? `/${tournament.max_participants}` : ""}</span>
        </div>
        {tournament.start_date && (
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">{new Date(tournament.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
          </div>
        )}
        {tournament.format && (
          <span className="text-[9px] text-muted-foreground ml-auto capitalize">{tournament.format.replace(/_/g, " ")}</span>
        )}
      </div>
    </motion.div>
  );
}