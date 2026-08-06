import React from "react";
import { motion } from "framer-motion";
import { Plus, Sparkles } from "lucide-react";
import { Image } from "@/components/ui/image";
import { cn } from "@/lib/utils";

/**
 * PremiumStoryBar — Instagram-style story bar for the Quad social feed.
 * Shows user's story (add), viewed stories, and unviewed stories.
 *
 * Props:
 *  - stories: [{ id, user: { name, image }, viewed, is_live }]
 *  - onStoryPress: (storyId) => void
 *  - onAddStory: () => void
 *  - currentUser: { name, image }
 */
export default function PremiumStoryBar({ stories = [], onStoryPress, onAddStory, currentUser }) {
  return (
    <div className="flex items-center gap-3 overflow-x-auto no-scrollbar px-4 py-3">
      {/* Add your story */}
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={onAddStory}
        className="flex flex-col items-center gap-1 flex-shrink-0"
      >
        <div className="relative w-16 h-16 rounded-full glass flex items-center justify-center">
          {currentUser?.image ? (
            <Image src={currentUser.image} alt={currentUser.name} fittingType="fill" className="w-full h-full rounded-full" />
          ) : (
            <div className="w-full h-full rounded-full bg-muted flex items-center justify-center">
              <span className="text-[18px] font-bold text-muted-foreground">
                {(currentUser?.name || "?").charAt(0)}
              </span>
            </div>
          )}
          <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-primary border-2 border-background flex items-center justify-center">
            <Plus className="w-3.5 h-3.5 text-primary-foreground" strokeWidth={2.5} />
          </div>
        </div>
        <span className="text-[9px] font-medium text-muted-foreground">Your Story</span>
      </motion.button>

      {/* Divider */}
      <div className="w-px h-12 bg-border/40 flex-shrink-0" />

      {/* Stories */}
      {stories.map((story, i) => {
        const ringColor = story.viewed
          ? "ring-muted-foreground/30"
          : story.is_live
          ? "ring-destructive"
          : "ring-primary";

        return (
          <motion.button
            key={story.id}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04, duration: 0.25 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => onStoryPress?.(story.id)}
            className="flex flex-col items-center gap-1 flex-shrink-0"
          >
            <div className={cn("relative w-16 h-16 rounded-full p-0.5 ring-2 ring-offset-2 ring-offset-background", ringColor)}>
              {story.is_live && (
                <motion.div
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute -top-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full bg-destructive z-10"
                >
                  <span className="text-[7px] font-bold text-white uppercase tracking-wider">Live</span>
                </motion.div>
              )}
              <div className="w-full h-full rounded-full overflow-hidden bg-muted">
                {story.user?.image ? (
                  <Image src={story.user.image} alt={story.user.name} fittingType="fill" className="w-full h-full" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-[16px] font-bold text-muted-foreground">
                      {(story.user?.name || "?").charAt(0)}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <span className="text-[9px] font-medium text-foreground max-w-[60px] truncate">
              {story.user?.name?.split(" ")[0]}
            </span>
          </motion.button>
        );
      })}

      {/* Bud story */}
      <motion.button
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: stories.length * 0.04 + 0.1 }}
        whileTap={{ scale: 0.92 }}
        className="flex flex-col items-center gap-1 flex-shrink-0"
      >
        <div className="relative w-16 h-16 rounded-full p-0.5 ring-2 ring-primary ring-offset-2 ring-offset-background">
          <div className="w-full h-full rounded-full gradient-bud flex items-center justify-center overflow-hidden">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="w-6 h-6 text-white" strokeWidth={2} />
            </motion.div>
          </div>
        </div>
        <span className="text-[9px] font-bold text-primary">Bud</span>
      </motion.button>
    </div>
  );
}