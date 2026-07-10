import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { getJourneyStageForUser, getJourneyMilestone, getStageRecommendations } from "@/lib/universityJourney";

// Reusable banner showing the user's current journey stage and next milestone.
// Bud uses this to always remind the user where they are and what's next.
export default function JourneyStageBanner({ user }) {
  const stage = getJourneyStageForUser(user);
  const milestone = getJourneyMilestone(user);
  const recs = getStageRecommendations(user);

  if (!user) return null;

  const StageIcon = stage.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
      className="px-5 pb-6"
    >
      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-primary to-primary/80 p-5 shadow-[0_8px_30px_rgba(124,58,237,0.25)]">
        <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10" />
        <div className="absolute -right-2 -bottom-8 w-24 h-24 rounded-full bg-white/5" />

        <div className="relative z-10">
          {/* Stage indicator */}
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-9 h-9 rounded-[12px] bg-white/20 flex items-center justify-center">
              <StageIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-heading font-bold text-[15px] text-white">{stage.label}</p>
              <p className="text-[11px] text-white/80">{stage.description}</p>
            </div>
          </div>

          {/* Next milestone */}
          {milestone && (
            <div className="bg-white/10 rounded-[16px] p-3 mb-3">
              <p className="text-[11px] text-white/70 mb-0.5">Your next milestone</p>
              <p className="text-[14px] font-semibold text-white">{milestone.label}</p>
            </div>
          )}

          {/* Encouragement for alumni (no next milestone) */}
          {!milestone && (
            <p className="text-[12px] text-white/90 leading-relaxed mb-3">{stage.encouragement}</p>
          )}

          {/* Stage-specific recommendations */}
          {recs.length > 0 && (
            <div className="space-y-1.5 mb-3">
              {recs.slice(0, 2).map((rec, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Sparkles className="w-3 h-3 text-white/70 flex-shrink-0 mt-0.5" />
                  <p className="text-[12px] text-white/90">{rec}</p>
                </div>
              ))}
            </div>
          )}

          <Link
            to="/bud"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/20 text-white text-[12px] font-semibold spring-tap"
          >
            Ask Bud <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}