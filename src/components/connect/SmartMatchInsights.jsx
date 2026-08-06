import React from "react";
import { motion } from "framer-motion";
import {
  BookOpen, Users, Heart, CalendarDays, FlaskConical,
  Target, Clock, Sparkles, TrendingUp,
} from "lucide-react";
import { EASE } from "@/lib/motion/motionPresets";

const MATCH_REASONS = {
  shared_classes: { icon: BookOpen, label: "Shared Classes", color: "hsl(217 91% 60%)", format: (v) => `${v} class${v > 1 ? "es" : ""} together` },
  assignment_similarity: { icon: Target, label: "Similar Assignments", color: "hsl(142 71% 45%)", format: (v) => `${v} shared assignments` },
  common_interests: { icon: Heart, label: "Common Interests", color: "hsl(330 75% 55%)", format: (v) => `${v} shared interests` },
  mutual_communities: { icon: Users, label: "Mutual Communities", color: "hsl(280 65% 60%)", format: (v) => `${v} shared communities` },
  mutual_friends: { icon: Users, label: "Mutual Friends", color: "hsl(251 90% 67%)", format: (v) => `${v} mutual friend${v > 1 ? "s" : ""}` },
  upcoming_events: { icon: CalendarDays, label: "Upcoming Events", color: "hsl(24 90% 55%)", format: (v) => `${v} shared events` },
  research_topics: { icon: FlaskConical, label: "Research Topics", color: "hsl(160 70% 45%)", format: (v) => `${v} shared research topics` },
  career_goals: { icon: Target, label: "Career Goals", color: "hsl(200 80% 55%)", format: (v) => `${v} aligned career goals` },
  learning_style: { icon: BookOpen, label: "Learning Style", color: "hsl(46 74% 55%)", format: (v) => `${v}% style match` },
  availability: { icon: Clock, label: "Availability", color: "hsl(142 71% 45%)", format: (v) => `Available ${v}` },
};

/**
 * SmartMatchInsights — Bud AI matching panel showing WHY a student is recommended.
 *
 * Props:
 *  - student: { name }
 *  - matchScore: number (0-100)
 *  - reasons: [{ type: string, value: number }]
 *  - onConnect: () => void
 */
export default function SmartMatchInsights({ student, matchScore = 0, reasons = [], onConnect }) {
  const topReasons = reasons.filter((r) => MATCH_REASONS[r.type]).slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="crystal-card rounded-[16px] overflow-hidden"
    >
      {/* Header */}
      <div className="relative p-3 bg-gradient-to-br from-primary/8 to-transparent">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-primary" strokeWidth={2.2} />
          </motion.div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-primary">Bud Recommends</p>
            <p className="text-[12px] font-bold text-foreground truncate">
              {student?.name ? `You & ${student.name}` : "Smart Match"}
            </p>
          </div>

          {/* Match score */}
          {matchScore > 0 && (
            <div className="flex flex-col items-center">
              <div className="relative w-10 h-10">
                <svg className="w-10 h-10 -rotate-90" viewBox="0 0 40 40">
                  <circle cx="20" cy="20" r="16" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                  <motion.circle
                    cx="20"
                    cy="20"
                    r="16"
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 16}
                    initial={{ strokeDashoffset: 2 * Math.PI * 16 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 16 * (1 - matchScore / 100) }}
                    transition={{ duration: 1, ease: EASE, delay: 0.2 }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[11px] font-bold text-primary tabular-nums">{matchScore}%</span>
                </div>
              </div>
              <span className="text-[7px] text-muted-foreground uppercase tracking-wider mt-0.5">Match</span>
            </div>
          )}
        </div>
      </div>

      {/* Reasons */}
      {topReasons.length > 0 ? (
        <div className="px-3 py-2 space-y-1.5">
          {topReasons.map((r, i) => {
            const config = MATCH_REASONS[r.type];
            const Icon = config.icon;
            return (
              <motion.div
                key={r.type}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08, duration: 0.3 }}
                className="flex items-center gap-2 p-1.5 rounded-[10px] glass"
              >
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${config.color}20` }}>
                  <Icon className="w-3 h-3" strokeWidth={2.2} style={{ color: config.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-foreground">{config.label}</p>
                  <p className="text-[9px] text-muted-foreground">{config.format(r.value)}</p>
                </div>
                <TrendingUp className="w-3 h-3 text-success" strokeWidth={2.2} />
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="px-4 py-3 text-center">
          <p className="text-[11px] text-muted-foreground italic">
            Bud is still learning about your campus connections.
          </p>
        </div>
      )}

      {/* Connect CTA */}
      <div className="px-3 pb-3">
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={onConnect}
          className="w-full h-9 rounded-full bg-primary text-[12px] font-bold text-primary-foreground spring-tap flex items-center justify-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" strokeWidth={2.2} />
          Connect with {student?.name?.split(" ")[0] || "them"}
        </motion.button>
      </div>
    </motion.div>
  );
}

export { MATCH_REASONS };