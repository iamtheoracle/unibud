import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Award, Search, LayoutGrid, List, Share2,
  BookOpen, Flame, Briefcase, Users, Trophy, X,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

const CATEGORIES = [
  { id: "all", label: "All", icon: Award },
  { id: "academic", label: "Academic", icon: BookOpen },
  { id: "study", label: "Study", icon: Flame },
  { id: "projects", label: "Projects", icon: Briefcase },
  { id: "communities", label: "Communities", icon: Users },
  { id: "career", label: "Career", icon: Trophy },
];

const VIEW_MODES = [
  { id: "grid", label: "Grid", icon: LayoutGrid },
  { id: "timeline", label: "Timeline", icon: List },
];

export default function AchievementGallery() {
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();
  const [category, setCategory] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [search, setSearch] = useState("");
  const [shareItem, setShareItem] = useState(null);

  const { data: achievements, isLoading } = useQuery({
    queryKey: ["achievement-gallery"],
    queryFn: () => base44.entities.StudentAchievement.list("-date_earned", 200),
    enabled: isOnline,
  });

  const filtered = useMemo(() => {
    if (!achievements) return [];
    let list = achievements;

    if (category !== "all") {
      list = list.filter((a) => a.category === category);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.title?.toLowerCase().includes(q) ||
          a.description?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [achievements, category, search]);

  // Group by date for timeline
  const timelineGroups = useMemo(() => {
    if (viewMode !== "timeline") return [];
    const groups = {};
    filtered.forEach((a) => {
      const date = a.date_earned ? new Date(a.date_earned).toLocaleDateString("en", { month: "long", year: "numeric" }) : "Unspecified";
      if (!groups[date]) groups[date] = [];
      groups[date].push(a);
    });
    return Object.entries(groups);
  }, [filtered, viewMode]);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 px-4 pt-3 pb-2 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-card flex items-center justify-center active:scale-90 transition-transform" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <ArrowLeft className="w-4 h-4 text-foreground" strokeWidth={2.2} />
          </button>
          <div className="flex-1">
            <h1 className="text-[18px] font-bold text-foreground tracking-tight">Achievements</h1>
            <p className="text-[11px] text-muted-foreground">{filtered.length} earned</p>
          </div>
          <div className="flex gap-1">
            {VIEW_MODES.map((v) => {
              const Icon = v.icon;
              return (
                <button
                  key={v.id}
                  onClick={() => setViewMode(v.id)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90 ${
                    viewMode === v.id ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground"
                  }`}
                  style={viewMode !== v.id ? { boxShadow: "0 1px 2px rgba(0,0,0,0.04)" } : {}}
                >
                  <Icon className="w-4 h-4" strokeWidth={2.2} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-2.5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={2.2} />
          <input
            type="text"
            placeholder="Search achievements..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-full bg-card text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}
          />
        </div>

        {/* Category filters */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            return (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={`flex items-center gap-1.5 px-3 h-8 rounded-full text-[12px] font-bold whitespace-nowrap transition-all active:scale-95 ${
                  category === c.id ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground"
                }`}
                style={category !== c.id ? { boxShadow: "0 1px 2px rgba(0,0,0,0.04)" } : {}}
              >
                <Icon className="w-3.5 h-3.5" strokeWidth={2.2} />
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-[640px] mx-auto px-4 pt-4">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square rounded-[20px] bg-card animate-pulse" style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="w-16 h-16 rounded-[20px] bg-muted flex items-center justify-center mb-5">
              <Award className="w-7 h-7 text-muted-foreground" strokeWidth={1.6} />
            </div>
            <h3 className="text-[16px] font-bold text-foreground mb-1.5">No achievements yet</h3>
            <p className="text-[12px] text-muted-foreground leading-relaxed max-w-[280px]">
              {search || category !== "all"
                ? "No achievements match your filters. Try adjusting them."
                : "Achievements you earn will appear here. Keep studying and participating!"}
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((a, i) => (
              <AchievementCard key={a.id} achievement={a} index={i} onShare={() => setShareItem(a)} />
            ))}
          </div>
        ) : (
          <div className="space-y-5">
            {timelineGroups.map(([month, items]) => (
              <div key={month}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <h3 className="text-[13px] font-bold text-foreground">{month}</h3>
                  <div className="flex-1 h-px bg-border/30" />
                  <span className="text-[10px] text-muted-foreground">{items.length}</span>
                </div>
                <div className="space-y-2 pl-4 border-l border-border/20">
                  {items.map((a, i) => (
                    <AchievementRow key={a.id} achievement={a} index={i} onShare={() => setShareItem(a)} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Share sheet */}
      <AnimatePresence>
        {shareItem && (
          <ShareSheet achievement={shareItem} onClose={() => setShareItem(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function AchievementCard({ achievement, index, onShare }) {
  const Icon = ACHIEVEMENT_ICONS[achievement.category] || Award;
  const dateStr = achievement.date_earned
    ? new Date(achievement.date_earned).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })
    : "";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05, type: "spring", stiffness: 200, damping: 20 }}
      className="relative rounded-[20px] bg-card p-4 flex flex-col items-center text-center overflow-hidden"
      style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.03), 0 4px 12px rgba(0,0,0,0.04)" }}
    >
      {/* Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-chocolate/5 pointer-events-none" />

      <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-primary to-chocolate flex items-center justify-center mb-2.5" style={{ boxShadow: "0 4px 16px rgba(255,122,0,0.2)" }}>
        <Icon className="w-6 h-6 text-white" strokeWidth={2} />
      </div>

      <p className="text-[12px] font-bold text-foreground leading-tight line-clamp-2">{achievement.title}</p>
      {achievement.description && (
        <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{achievement.description}</p>
      )}

      {dateStr && (
        <p className="text-[9px] font-bold text-muted-foreground mt-2 uppercase tracking-wide">{dateStr}</p>
      )}

      <button
        onClick={onShare}
        className="mt-2 w-7 h-7 rounded-full bg-muted flex items-center justify-center active:scale-90 transition-transform"
      >
        <Share2 className="w-3 h-3 text-muted-foreground" strokeWidth={2.2} />
      </button>
    </motion.div>
  );
}

function AchievementRow({ achievement, index, onShare }) {
  const Icon = ACHIEVEMENT_ICONS[achievement.category] || Award;
  const dateStr = achievement.date_earned
    ? new Date(achievement.date_earned).toLocaleDateString("en", { month: "short", day: "numeric" })
    : "";

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center gap-3 p-3 rounded-[16px] bg-card"
      style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.03), 0 4px 12px rgba(0,0,0,0.04)" }}
    >
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-chocolate flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-white" strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-bold text-foreground truncate">{achievement.title}</p>
        {achievement.description && (
          <p className="text-[10px] text-muted-foreground truncate">{achievement.description}</p>
        )}
        {dateStr && (
          <p className="text-[9px] text-muted-foreground mt-0.5">{dateStr}</p>
        )}
      </div>
      <button onClick={onShare} className="w-7 h-7 rounded-full bg-muted flex items-center justify-center active:scale-90 transition-transform flex-shrink-0">
        <Share2 className="w-3 h-3 text-muted-foreground" strokeWidth={2.2} />
      </button>
    </motion.div>
  );
}

function ShareSheet({ achievement, onClose }) {
  const shareText = `I earned "${achievement.title}" on UNIBUD! ${achievement.description || ""}`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: achievement.title, text: shareText });
      } catch (e) {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(shareText);
    }
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative w-full max-w-[640px] bg-background rounded-t-[28px] p-6 pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full bg-muted mx-auto mb-4" />
        <div className="flex flex-col items-center text-center mb-5">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-chocolate flex items-center justify-center mb-3" style={{ boxShadow: "0 4px 20px rgba(255,122,0,0.3)" }}>
            <Award className="w-7 h-7 text-white" strokeWidth={2} />
          </div>
          <h3 className="text-[16px] font-bold text-foreground">{achievement.title}</h3>
          {achievement.description && <p className="text-[12px] text-muted-foreground mt-1">{achievement.description}</p>}
        </div>
        <button
          onClick={handleShare}
          className="w-full h-11 rounded-full bg-primary text-primary-foreground text-[14px] font-bold active:scale-95 transition-transform"
        >
          Share Achievement
        </button>
        <button onClick={onClose} className="w-full h-11 mt-2 text-[14px] font-bold text-muted-foreground">
          Cancel
        </button>
      </motion.div>
    </motion.div>
  );
}

const ACHIEVEMENT_ICONS = {
  study: Flame,
  assignments: BookOpen,
  exams: Award,
  learning: BookOpen,
  collaboration: Users,
  campus_life: Users,
  milestone: Trophy,
};