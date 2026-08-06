import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Link2, MessageCircle, Users, BookOpen, Bookmark, Building2,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { hapticTap } from "@/lib/haptics";

const SHARE_TARGETS = [
  { id: "messages", label: "Send in Messages", icon: MessageCircle },
  { id: "study_group", label: "Study Group", icon: Users },
  { id: "course", label: "Course", icon: BookOpen },
  { id: "community", label: "Community", icon: Building2 },
  { id: "bookmarks", label: "Save to Bookmarks", icon: Bookmark },
  { id: "copy_link", label: "Copy Link", icon: Link2 },
];

/**
 * OrbitMediaShareSheet — premium share sheet for media.
 * Shares within the UNIBUD ecosystem only.
 */
export default function OrbitMediaShareSheet({ post, open, onClose }) {
  const { toast } = useToast();

  const handleShare = (target) => {
    hapticTap();
    if (target.id === "copy_link") {
      navigator.clipboard?.writeText(`${window.location.origin}/quad`);
      toast({ title: "Link copied to clipboard" });
    } else if (target.id === "bookmarks") {
      toast({ title: "Saved to bookmarks" });
    } else {
      toast({ title: `Shared to ${target.label}` });
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-[60] flex items-end"
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
            className="relative w-full glass-strong rounded-t-[28px] p-5 pb-8 safe-area-pb"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30 mx-auto" />
              <button onClick={onClose} className="absolute right-4 top-4 w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted/60 spring-tap">
                <X className="w-4 h-4 text-muted-foreground" strokeWidth={2.5} />
              </button>
            </div>

            <h3 className="font-heading font-bold text-[17px] text-foreground mb-4">Share</h3>

            <div className="grid grid-cols-3 gap-3">
              {SHARE_TARGETS.map((target) => {
                const Icon = target.icon;
                return (
                  <button
                    key={target.id}
                    onClick={() => handleShare(target)}
                    className="flex flex-col items-center gap-2 p-4 rounded-[18px] glass hover:bg-muted/40 spring-tap"
                  >
                    <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" strokeWidth={2} />
                    </div>
                    <span className="text-[10px] font-medium text-foreground text-center leading-tight">{target.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}