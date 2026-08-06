import React from "react";
import { motion } from "framer-motion";
import { Sparkles, ChevronRight } from "lucide-react";
import PremiumAvatar from "@/components/ui/PremiumAvatar";
import { EASE } from "@/lib/motion/motionPresets";

const BUDDY_TYPE_LABELS = {
  study_partner: "Study Partner",
  coding_partner: "Coding Partner",
  lab_partner: "Lab Partner",
  research_partner: "Research Partner",
  language_exchange: "Language Exchange",
  exam_partner: "Exam Partner",
  accountability_partner: "Accountability Partner",
  project_team: "Project Team",
  hackathon_team: "Hackathon Team",
  other: "Study Buddy",
};

/**
 * SmartMatchCard — Bud AI recommended connection card.
 *
 * Shows: Bud badge, match reasons (shared classes, interests, etc.),
 * student avatar/name, match score, and connect action.
 *
 * Props:
 *  - student: profile object
 *  - matchReasons: string[] (e.g. "Same CSC 201 class", "Both in AI Club")
 *  - matchScore: number 0-100
 *  - onConnect: () => void
 *  - onOpen: () => void
 *  - delay: stagger
 */
export default function SmartMatchCard({ student, matchReasons = [], matchScore = 0, onConnect, onOpen, delay = 0 }) {
  if (!student) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: EASE }}
      whileTap={{ scale: 0.99 }}
      onClick={onOpen}
      className="relative overflow-hidden crystal-card rounded-[22px] p-4 cursor-pointer hover-lift"
    >
      {/* Bud AI glow */}
      <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-primary/8 blur-3xl pointer-events-none" />

      <div className="relative z-10">
        {/* Bud header */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-primary" strokeWidth={2.5} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Bud Suggests</span>
          {matchScore > 0 && (
            <div className="ml-auto flex items-center gap-1">
              <div className="w-16 h-1 rounded-full bg-muted overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${matchScore}%` }}
                  transition={{ delay: delay + 0.2, duration: 0.6, ease: EASE }}
                  className="h-full rounded-full bg-primary"
                />
              </div>
              <span className="text-[9px] font-bold text-primary tabular-nums">{matchScore}%</span>
            </div>
          )}
        </div>

        {/* Student info */}
        <div className="flex items-center gap-3 mb-3">
          <PremiumAvatar src={student.image} alt={student.name} size="md" verified={student.is_verified} />
          <div className="flex-1 min-w-0">
            <h3 className="font-heading font-bold text-[14px] text-foreground truncate">{student.name}</h3>
            <p className="text-[11px] text-muted-foreground truncate">
              {[student.faculty, student.department].filter(Boolean).join(" · ")}
            </p>
          </div>
        </div>

        {/* Match reasons */}
        {matchReasons.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {matchReasons.slice(0, 3).map((reason, i) => (
              <span key={i} className="px-2 py-0.5 rounded-full glass text-[9px] font-semibold text-muted-foreground">
                {reason}
              </span>
            ))}
            {matchReasons.length > 3 && (
              <span className="px-2 py-0.5 text-[9px] font-semibold text-muted-foreground">
                +{matchReasons.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2.5 card-separator">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={(e) => { e.stopPropagation(); onConnect?.(); }}
            className="flex-1 h-9 rounded-full bg-primary text-[12px] font-bold text-primary-foreground spring-tap flex items-center justify-center gap-1"
          >
            Connect
            <ChevronRight className="w-3.5 h-3.5" strokeWidth={2.5} style={{ width: 14, height: 14 }} />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={(e) => { e.stopPropagation(); onOpen?.(); }}
            className="h-9 px-4 rounded-full glass text-[12px] font-bold text-foreground spring-tap"
          >
            Profile
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

export { BUDDY_TYPE_LABELS };