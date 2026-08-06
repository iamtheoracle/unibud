import React from "react";
import { motion } from "framer-motion";
import { Radio, Calendar, Compass } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";

/**
 * LiveEmptyState — premium empty state for when no live sessions exist.
 *
 * Encourages students to discover upcoming events or start a community session.
 *
 * Props:
 *  - variant: "no_live" | "no_upcoming" | "no_following" | "no_category"
 *  - onDiscover: () => void — navigate to upcoming events
 *  - onStartSession: () => void — start a community session
 */
export default function LiveEmptyState({ variant = "no_live", onDiscover, onStartSession }) {
  const config = {
    no_live: {
      icon: Radio,
      title: "No Live Sessions Right Now",
      description: "There are no active broadcasts at the moment. Check upcoming events or start a community session.",
      budGuidance: "Tip: Subscribe to your favourite organizations so you never miss when they go live.",
      primaryAction: onDiscover ? { label: "Discover Events", icon: Compass } : null,
      secondaryAction: onStartSession ? { label: "Start a Session", icon: Calendar } : null,
    },
    no_upcoming: {
      icon: Calendar,
      title: "No Upcoming Sessions",
      description: "There aren't any scheduled live sessions yet. Check back soon or browse past recordings.",
      budGuidance: "Follow communities and clubs to get notified when they schedule live events.",
      primaryAction: onDiscover ? { label: "Browse Communities", icon: Compass } : null,
    },
    no_following: {
      icon: Radio,
      title: "No Live Sessions From People You Follow",
      description: "None of the organizations or people you follow are live right now.",
      budGuidance: "Follow more communities and campus leaders to see their live sessions here.",
      primaryAction: onDiscover ? { label: "Discover Creators", icon: Compass } : null,
    },
    no_category: {
      icon: Radio,
      title: "Nothing Live in This Category",
      description: "There are no live sessions in this category right now. Try a different filter or check back later.",
      primaryAction: onDiscover ? { label: "Browse All Live", icon: Compass } : null,
    },
  };

  const { icon, title, description, budGuidance, primaryAction, secondaryAction } = config[variant] || config.no_live;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <EmptyState
        icon={icon}
        title={title}
        description={description}
        budGuidance={budGuidance}
        action={
          (primaryAction || secondaryAction) && (
            <div className="flex flex-col gap-2 items-center">
              {primaryAction && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={onDiscover}
                  className="h-10 px-6 rounded-full bg-primary text-[13px] font-bold text-primary-foreground spring-tap flex items-center justify-center gap-1.5"
                >
                  <primaryAction.icon className="w-4 h-4" strokeWidth={2.5} />
                  {primaryAction.label}
                </motion.button>
              )}
              {secondaryAction && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={onStartSession}
                  className="h-9 px-5 rounded-full glass text-[12px] font-bold text-foreground spring-tap flex items-center justify-center gap-1.5"
                >
                  <secondaryAction.icon className="w-3.5 h-3.5" strokeWidth={2.5} />
                  {secondaryAction.label}
                </motion.button>
              )}
            </div>
          )
        }
      />
    </motion.div>
  );
}