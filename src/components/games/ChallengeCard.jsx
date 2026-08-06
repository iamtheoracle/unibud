import React from "react";
import { motion } from "framer-motion";
import { Users, Target, Calendar } from "lucide-react";
import { getChallengeType } from "./gamesConstants";

const EASE = [0.16, 1, 0.3, 1];

/**
 * ChallengeCard — displays a community challenge with target metric and participants.
 */
export default function ChallengeCard({ challenge }) {
  const challengeType = getChallengeType(challenge.challenge_type);
  const Icon = challengeType.Icon;
  const participants = challenge.participants || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: EASE }}
      className="p-3 rounded-[18px] glass-card"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl grid place-items-center bg-primary/10 shrink-0">
          <Icon className="w-5 h-5 text-primary" strokeWidth={1.6} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-foreground line-clamp-1">{challenge.title}</p>
          <span className="text-[10px] text-muted-foreground">{challengeType.label} Challenge</span>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
          challenge.status === "active" ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"
        }`}>
          {challenge.status === "active" ? "Active" : challenge.status}
        </span>
      </div>

      {challenge.target_metric && (
        <div className="flex items-center gap-1.5 mt-2">
          <Target className="w-3 h-3 text-muted-foreground" />
          <span className="text-[11px] text-foreground/80 line-clamp-1">{challenge.target_metric}</span>
        </div>
      )}

      <div className="flex items-center gap-3 mt-2">
        <div className="flex items-center gap-1">
          <Users className="w-3 h-3 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground">{participants.length} joined</span>
        </div>
        {challenge.end_date && (
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">Ends {new Date(challenge.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}