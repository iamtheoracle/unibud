import React from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Plus,
  PenLine, Camera, Video, CircleDot, BarChart3, Calendar, Trophy,
  Users, MessageSquare, Megaphone,
  NotebookPen, Layers, ClipboardList, Briefcase, FlaskConical,
  FolderOpen, HelpCircle, Target,
  Search as SearchIcon, Building2, HeartHandshake, ShoppingBag, Pin, Sparkles,
  Film, Music, Tv, Newspaper, BookOpen, Headphones,
} from "lucide-react";
import { hapticTap } from "@/lib/haptics";
import { useQuickActions } from "@/hooks/useQuickActions";

const EASE = [0.16, 1, 0.3, 1];

/* ── Quick Actions — the most common creation actions.
   Sorted adaptively by usage frequency + pinning. ── */
const QUICK_ACTIONS = [
  { id: "post", label: "Post", icon: PenLine, to: "/square" },
  { id: "photo", label: "Photo", icon: Camera, camera: "post" },
  { id: "video", label: "Video", icon: Video, camera: "short" },
  { id: "discussion", label: "Discussion", icon: MessageSquare, to: "/square" },
  { id: "event", label: "Event", icon: Calendar, to: "/events" },
  { id: "poll", label: "Poll", icon: BarChart3, to: "/square" },
  { id: "marketplace", label: "Listing", icon: ShoppingBag, to: "/marketplace" },
  { id: "lost-found", label: "Lost & Found", icon: SearchIcon, to: "/lost-found" },
  { id: "community", label: "Community", icon: Users, to: "/communities" },
  { id: "note", label: "Study Note", icon: NotebookPen, to: "/study/notes" },
  { id: "study-group", label: "Study Group", icon: Users, to: "/study-groups" },
  { id: "resource", label: "Resource", icon: FolderOpen, to: "/knowledge" },
];

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
      { id: "photo", label: "Photo", icon: Camera, camera: "post" },
      { id: "video", label: "Video", icon: Video, camera: "short" },
      { id: "story", label: "Story", icon: CircleDot, camera: "story" },
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

export default function CreateSheet({ open, onClose, onMediaDiscussion, onCamera }) {
  const navigate = useNavigate();
  const { sorted: sortedQuickActions, pinned: pinnedActions, trackUsage, togglePin } = useQuickActions(QUICK_ACTIONS);

  const handleSelect = (option, isQuickAction = false) => {
    hapticTap();
    if (isQuickAction) trackUsage(option.id);
    onClose();
    if (option.camera) {
      setTimeout(() => onCamera?.(option.camera), 150);
    } else if (option.media) {
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

            {/* Quick Actions — adaptive to most-used actions */}
            {sortedQuickActions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05, duration: 0.3, ease: EASE }}
                className="px-5 pb-3"
              >
                <div className="flex items-center gap-2 mb-2.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Quick Actions
                  </span>
                </div>
                <div className="flex gap-2.5 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
                  {sortedQuickActions.map((action) => {
                    const Icon = action.icon;
                    const isPinned = pinnedActions.includes(action.id);
                    return (
                      <div key={action.id} className="relative shrink-0">
                        <button
                          onClick={() => handleSelect(action, true)}
                          className="flex flex-col items-center gap-1.5 w-[64px] spring-tap"
                        >
                          <div className="w-[46px] h-[46px] rounded-[14px] glass-card grid place-items-center hover-lift edge-light">
                            <Icon className="w-[20px] h-[20px] text-foreground" strokeWidth={1.8} />
                          </div>
                          <span className="text-[9px] font-medium text-muted-foreground text-center leading-tight line-clamp-1">
                            {action.label}
                          </span>
                        </button>
                        <button
                          onClick={() => togglePin(action.id)}
                          className="absolute -top-1 -right-1 w-[18px] h-[18px] rounded-full grid place-items-center spring-tap"
                          style={{ background: isPinned ? "hsl(var(--primary))" : "hsl(var(--muted))" }}
                          aria-label={isPinned ? "Unpin" : "Pin"}
                        >
                          <Pin
                            className="w-2.5 h-2.5"
                            style={{ color: isPinned ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))" }}
                            strokeWidth={2.5}
                          />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

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