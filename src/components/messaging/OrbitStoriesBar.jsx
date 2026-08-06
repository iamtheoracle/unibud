import React from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";

const EASE = [0.16, 1, 0.3, 1];

/**
 * OrbitStoriesBar — real student stories above conversations.
 * No fake stories. Only renders when real stories exist.
 * Categories: Friends, Communities, Campus, Clubs
 */
export default function OrbitStoriesBar({ user, onSelectStory }) {
  const { data: stories = [] } = useQuery({
    queryKey: ["orbit-stories", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const now = new Date().toISOString();
      const all = await base44.entities.Story.filter(
        { status: "active", expires_at: { $gte: now } },
        "-created_date",
        20
      );
      return all.filter(
        (s) => !s.university || s.university === user.university
      );
    },
    enabled: !!user,
    refetchInterval: 60000,
  });

  if (stories.length === 0) return null;

  return (
    <div className="px-4 pt-3 pb-1">
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
        <StoryAddButton />
        {stories.map((story, i) => (
          <StoryBubble
            key={story.id}
            story={story}
            delay={i * 0.04}
            onClick={() => onSelectStory?.(story)}
          />
        ))}
      </div>
    </div>
  );
}

function StoryAddButton() {
  return (
    <a
      href="/square"
      className="flex flex-col items-center gap-1.5 flex-shrink-0"
    >
      <div className="w-[58px] h-[58px] rounded-full border-[1.5px] border-dashed border-muted-foreground/25 flex items-center justify-center glass spring-tap">
        <Plus className="w-5 h-5 text-muted-foreground" strokeWidth={2} />
      </div>
      <span className="text-[10px] text-muted-foreground font-medium">Your Story</span>
    </a>
  );
}

function StoryBubble({ story, delay, onClick }) {
  const role = story.author_role || "student";
  const ringColor =
    role === "club"
      ? "ring-purple-400/40"
      : role === "lecturer"
      ? "ring-blue-400/40"
      : role === "admin"
      ? "ring-amber-400/40"
      : "ring-primary/30";

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: EASE, delay }}
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 flex-shrink-0 spring-tap"
    >
      <div className={`relative w-[58px] h-[58px] rounded-full ring-2 ${ringColor} ring-offset-2 ring-offset-background overflow-hidden`}>
        {story.media_url || story.author_image ? (
          <Image
            src={story.media_url || story.author_image}
            alt={story.author_name}
            fittingType="fill"
            className="w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-secondary text-[18px] font-bold text-foreground">
            {(story.author_name || "?").charAt(0)}
          </div>
        )}
      </div>
      <span className="text-[10px] text-muted-foreground font-medium max-w-[58px] truncate">
        {story.author_name?.split(" ")[0] || "Student"}
      </span>
    </motion.button>
  );
}