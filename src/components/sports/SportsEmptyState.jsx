import React from "react";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";

/**
 * SportsEmptyState — premium empty state for when no live sports data exists.
 *
 * Props:
 *  - variant: "no_live" | "no_fixtures" | "no_data" | "no_favorites"
 *  - onBrowse: () => void
 */
export default function SportsEmptyState({ variant = "no_live", onBrowse }) {
  const config = {
    no_live: {
      icon: Trophy,
      title: "No Live Matches Right Now",
      description: "There are no active matches at the moment. Check upcoming fixtures or follow your favourite teams.",
      budGuidance: "Follow teams to get notified when their matches go live.",
      action: { label: "Browse Fixtures", onClick: onBrowse },
    },
    no_fixtures: {
      icon: Trophy,
      title: "No Upcoming Fixtures",
      description: "There aren't any scheduled matches yet. Check back soon or explore campus tournaments.",
      budGuidance: "Follow leagues and teams to see upcoming fixtures here.",
      action: { label: "Discover Tournaments", onClick: onBrowse },
    },
    no_data: {
      icon: Trophy,
      title: "Sports Data Unavailable",
      description: "Live sports data isn't available right now. This could be temporary—try refreshing in a moment.",
      budGuidance: "If this persists, check your connection or try again later.",
    },
    no_favorites: {
      icon: Trophy,
      title: "No Favourite Teams Yet",
      description: "Follow your favourite university teams and leagues to see their matches, standings, and updates here.",
      budGuidance: "Search for your team or browse campus leagues to get started.",
      action: { label: "Find Teams", onClick: onBrowse },
    },
  };

  const { icon, title, description, budGuidance, action } = config[variant] || config.no_live;

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
          action && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={action.onClick}
              className="h-10 px-6 rounded-full bg-primary text-[13px] font-bold text-primary-foreground spring-tap"
            >
              {action.label}
            </motion.button>
          )
        }
      />
    </motion.div>
  );
}