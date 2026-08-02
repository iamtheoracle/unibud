import React from "react";
import { motion } from "framer-motion";
import { Film, Radio, Mic, Video } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";

const ICONS = {
  movies: Film,
  series: Film,
  podcasts: Mic,
  music: Radio,
  live: Radio,
  video: Video,
  general: Film,
};

/**
 * EntertainmentEmptyState — premium empty state for when no entertainment content exists.
 *
 * Props:
 *  - variant: "no_content" | "no_live" | "no_creators" | "no_podcasts" | "no_radio" | "no_watch_parties"
 *  - onCreate: () => void — navigate to creator studio or create content
 *  - onDiscover: () => void — browse available content
 */
export default function EntertainmentEmptyState({ variant = "no_content", onCreate, onDiscover }) {
  const config = {
    no_content: {
      icon: Film,
      title: "No Content Available Yet",
      description: "There's no entertainment content in this category right now. Be the first to share something with your campus.",
      budGuidance: "Students can upload videos, podcasts, and music, or go live to share campus moments with everyone.",
      primaryAction: onCreate ? { label: "Become a Creator", icon: Video } : null,
      secondaryAction: onDiscover ? { label: "Browse All Content", icon: Film } : null,
    },
    no_live: {
      icon: Radio,
      title: "No Live Streams Right Now",
      description: "There are no active live streams at the moment. Check back soon or start your own broadcast.",
      budGuidance: "Follow creators and organizations to get notified when they go live.",
      primaryAction: onCreate ? { label: "Start Streaming", icon: Radio } : null,
      secondaryAction: onDiscover ? { label: "Browse Recordings", icon: Film } : null,
    },
    no_creators: {
      icon: Video,
      title: "No Creators Yet",
      description: "No students have published content in this category yet. This is your chance to be a campus creator.",
      budGuidance: "Upload your first video, podcast, or music track to start building your audience.",
      primaryAction: onCreate ? { label: "Start Creating", icon: Video } : null,
    },
    no_podcasts: {
      icon: Mic,
      title: "No Podcasts Available",
      description: "There are no podcasts to listen to right now. If you have something to say, start your own show.",
      budGuidance: "Podcasts are a great way to share knowledge, stories, and campus perspectives with fellow students.",
      primaryAction: onCreate ? { label: "Start a Podcast", icon: Mic } : null,
    },
    no_radio: {
      icon: Radio,
      title: "No Campus Radio Broadcasting",
      description: "No campus radio stations are live right now. Check the schedule for upcoming shows.",
      budGuidance: "Campus radio shows are scheduled throughout the week. Follow stations to get notified.",
    },
    no_watch_parties: {
      icon: Video,
      title: "No Active Watch Parties",
      description: "There are no watch parties happening right now. Create one and invite your classmates to watch together.",
      budGuidance: "Watch parties let you sync playback and chat with friends while watching campus content together.",
      primaryAction: onCreate ? { label: "Start a Watch Party", icon: Video } : null,
    },
  };

  const { icon, title, description, budGuidance, primaryAction, secondaryAction } = config[variant] || config.no_content;

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
                  onClick={onCreate}
                  className="h-10 px-6 rounded-full bg-primary text-[13px] font-bold text-primary-foreground spring-tap flex items-center justify-center gap-1.5"
                >
                  <primaryAction.icon className="w-4 h-4" strokeWidth={2.5} />
                  {primaryAction.label}
                </motion.button>
              )}
              {secondaryAction && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={onDiscover}
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