import React from "react";
import { motion } from "framer-motion";
import { Radio } from "lucide-react";
import { useSocialLiveActivity } from "@/lib/social/useSocialData";

const EASE = [0.16, 1, 0.3, 1];

const ACTOR_VERB = {
  post: "shared",
  join: "joined",
  follow: "started following",
  reaction: "reacted to",
  comment: "commented on",
  event: "scheduled",
};

function timeLabel(mins) {
  if (mins < 1) return "now";
  if (mins < 60) return `${Math.round(mins)}m`;
  return `${Math.round(mins / 60)}h`;
}

/**
 * SocialLiveActivity — a premium "happening now" stream of live campus social
 * activity, backed by the social mock data layer. Shown on the social Quad.
 */
export default function SocialLiveActivity() {
  const { data, isLoading } = useSocialLiveActivity();
  const items = (data || []).slice(0, 5);

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="crystal-card p-3.5 mb-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="relative flex items-center justify-center w-6 h-6 rounded-full bg-destructive/12">
          <Radio className="w-3.5 h-3.5 text-destructive" strokeWidth={2.2} />
          <span className="absolute -right-0.5 -top-0.5 w-2 h-2 rounded-full bg-destructive live-pulse" />
        </span>
        <h2 className="text-[13px] font-bold text-foreground">Live on campus</h2>
      </div>

      {isLoading ? (
        <div className="space-y-2.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full shimmer" />
              <div className="flex-1">
                <div className="h-3 w-3/4 rounded shimmer mb-1" />
                <div className="h-2.5 w-1/3 rounded shimmer" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, duration: 0.35, ease: EASE }}
              className="flex items-center gap-2.5"
            >
              {a.actor_image ? (
                <img src={a.actor_image} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-[11px] font-bold text-primary flex-shrink-0">
                  {a.actor_name?.charAt(0)}
                </div>
              )}
              <p className="flex-1 text-[12px] text-foreground/90 leading-snug min-w-0">
                <span className="font-semibold">{a.actor_name}</span>{" "}
                <span className="text-muted-foreground">{ACTOR_VERB[a.type] || "updated"}</span>{" "}
                <span className="font-medium truncate">{a.text}</span>
                {a.target && <span className="text-primary font-medium"> · {a.target}</span>}
              </p>
              <span className="text-[10px] text-muted-foreground/70 font-medium flex-shrink-0">{timeLabel(a.minutes_ago)}</span>
            </motion.div>
          ))}
        </div>
      )}
    </motion.section>
  );
}