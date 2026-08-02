import React from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Plus,
  PenLine, Camera, Video, CircleDot, BarChart3, Calendar, Trophy,
  Users, MessageSquare, Megaphone,
  NotebookPen, Layers, ClipboardList, Briefcase, FlaskConical,
  FolderOpen, HelpCircle, Target,
  Search as SearchIcon, Building2, HeartHandshake,
  Film, Music, Tv, Newspaper, BookOpen, Headphones,
} from "lucide-react";
import { hapticTap } from "@/lib/haptics";

const EASE = [0.16, 1, 0.3, 1];

/* ── Category definitions ──
   Each option either navigates to a route or opens the smart
   MediaDiscussionComposer. No fake content — every option leads
   to a real creation flow. */
const CATEGORIES = [
  {
    id: "social",
    label: "Social",
    accent: "251 90% 67%",
    options: [
      { id: "post", label: "Post", icon: PenLine, to: "/square" },
      { id: "photo", label: "Photo", icon: Camera, to: "/square" },
      { id: "video", label: "Video", icon: Video, to: "/square" },
      { id: "story", label: "Story", icon: CircleDot, to: "/square" },
      { id: "poll", label: "Poll", icon: BarChart3, to: "/square" },
      { id: "event", label: "Event", icon: Calendar, to: "/events" },
      { id: "challenge", label: "Challenge", icon: Trophy, to: "/challenges" },
      { id: "community", label: "Community", icon: Users, to: "/communities" },
      { id: "discussion", label: "Discussion", icon: MessageSquare, to: "/square" },
      { id: "announcement", label: "Announcement", icon: Megaphone, to: "/communication" },
    ],
  },
  {
    id: "academic",
    label: "Academic",
    accent: "217 91% 60%",
    options: [
      { id: "note", label: "Study Note", icon: NotebookPen, to: "/study/notes" },
      { id: "flashcards", label: "Flashcards", icon: Layers, to: "/study/flashcards" },
      { id: "study-group", label: "Study Group", icon: Users, to: "/study-groups" },
      { id: "assignment", label: "Assignment", icon: ClipboardList, to: "/assignments" },
      { id: "project", label: "Project Workspace", icon: Briefcase, to: "/collaboration" },
      { id: "research", label: "Research", icon: FlaskConical, to: "/study/research" },
      { id: "collection", label: "Collection", icon: FolderOpen, to: "/knowledge" },
      { id: "quiz", label: "Quiz", icon: HelpCircle, to: "/study/practice" },
      { id: "practice", label: "Practice", icon: Target, to: "/study/practice" },
    ],
  },
  {
    id: "campus",
    label: "Campus",
    accent: "142 71% 45%",
    options: [
      { id: "marketplace", label: "Listing", icon: Plus, to: "/marketplace" },
      { id: "lost-found", label: "Lost & Found", icon: SearchIcon, to: "/lost-found" },
      { id: "club", label: "Club", icon: Building2, to: "/clubs" },
      { id: "campus-event", label: "Event", icon: Calendar, to: "/events" },
      { id: "opportunity", label: "Opportunity", icon: Briefcase, to: "/opportunities" },
      { id: "volunteer", label: "Volunteer", icon: HeartHandshake, to: "/opportunities" },
    ],
  },
  {
    id: "media",
    label: "Media",
    accent: "0 77% 52%",
    options: [
      { id: "movie", label: "Movie", icon: Film, media: "movie" },
      { id: "music", label: "Music", icon: Music, media: "music" },
      { id: "tv", label: "TV Series", icon: Tv, media: "tv_show" },
      { id: "sports", label: "Sports", icon: Trophy, media: "sports" },
      { id: "news", label: "News", icon: Newspaper, media: "news" },
      { id: "book", label: "Book Review", icon: BookOpen, media: "book" },
      { id: "podcast", label: "Podcast", icon: Headphones, media: "podcast" },
    ],
  },
];

export default function CreateSheet({ open, onClose, onMediaDiscussion }) {
  const navigate = useNavigate();

  const handleSelect = (option) => {
    hapticTap();
    onClose();
    if (option.media) {
      setTimeout(() => onMediaDiscussion(option.media), 150);
    } else if (option.to) {
      setTimeout(() => navigate(option.to), 150);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-[90] backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
            className="fixed bottom-0 inset-x-0 z-[100] bg-card rounded-t-[28px] elevated-shadow border-t border-border/30 max-h-[88vh] overflow-y-auto no-scrollbar"
          >
            <div className="w-10 h-1 rounded-full bg-muted-foreground/30 mx-auto mt-3" />

            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-3 pb-1">
              <div>
                <h3 className="font-heading font-bold text-[18px] text-foreground tracking-tight">
                  Create
                </h3>
                <p className="text-[12px] text-muted-foreground mt-0.5">
                  What would you like to create today?
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center spring-tap"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Category sections */}
            <div className="px-5 pb-8 pt-3 space-y-5">
              {CATEGORIES.map((cat, catIdx) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: catIdx * 0.06, duration: 0.35, ease: EASE }}
                >
                  <div className="flex items-center gap-2 mb-2.5">
                    <div
                      className="w-1.5 h-4 rounded-full"
                      style={{ background: `hsl(${cat.accent})` }}
                    />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      {cat.label}
                    </span>
                  </div>
                  <div className="flex gap-2.5 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
                    {cat.options.map((option, i) => {
                      const Icon = option.icon;
                      return (
                        <button
                          key={option.id}
                          onClick={() => handleSelect(option)}
                          className="flex flex-col items-center gap-1.5 w-[74px] shrink-0 spring-tap"
                        >
                          <div
                            className="w-[52px] h-[52px] rounded-[16px] glass-card grid place-items-center hover-lift edge-light"
                            style={{ background: `hsl(${cat.accent} / 0.06)` }}
                          >
                            <Icon
                              className="w-[22px] h-[22px]"
                              strokeWidth={1.8}
                              style={{ color: `hsl(${cat.accent})` }}
                            />
                          </div>
                          <span className="text-[10px] font-medium text-muted-foreground text-center leading-tight line-clamp-2">
                            {option.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}