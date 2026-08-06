import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Award, Search, LayoutGrid, List, Share2,
  BookOpen, Flame, Briefcase, Users, Trophy, TrendingUp,
  GraduationCap, Target, ScrollText, BadgeCheck, Heart,
  HandHeart, Medal, Rocket, FlaskConical, CalendarDays,
  Star, Mic, Video,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import AchievementDetailSheet from "@/components/achievements/AchievementDetailSheet";
import AchievementShareSheet from "@/components/achievements/AchievementShareSheet";
import BudMilestoneSummary from "@/components/achievements/BudMilestoneSummary";

const EASE = [0.16, 1, 0.3, 1];

const CATEGORIES = [
  { id: "all", label: "All", icon: Award },
  { id: "academic", label: "Academic", icon: BookOpen },
  { id: "gpa", label: "GPA", icon: TrendingUp },
  { id: "study", label: "Study", icon: Flame },
  { id: "streaks", label: "Streaks", icon: Flame },
  { id: "course_completion", label: "Courses", icon: GraduationCap },
  { id: "degree_progress", label: "Degree", icon: Target },
  { id: "assignments", label: "Assignments", icon: BookOpen },
  { id: "exams", label: "Exams", icon: Award },
  { id: "scholarships", label: "Scholarships", icon: ScrollText },
  { id: "certifications", label: "Certifications", icon: BadgeCheck },
  { id: "leadership", label: "Leadership", icon: Users },
  { id: "clubs", label: "Clubs", icon: Users },
  { id: "community", label: "Community", icon: Heart },
  { id: "volunteer", label: "Volunteer", icon: HandHeart },
  { id: "competitions", label: "Competitions", icon: Medal },
  { id: "hackathon", label: "Hackathon", icon: Rocket },
  { id: "research", label: "Research", icon: FlaskConical },
  { id: "events", label: "Events", icon: CalendarDays },
  { id: "mentor", label: "Mentor", icon: Star },
  { id: "creator", label: "Creator", icon: Video },
  { id: "podcast", label: "Podcast", icon: Mic },
  { id: "milestone", label: "Milestones", icon: Trophy },
  { id: "collaboration", label: "Collaboration", icon: Users },
  { id: "campus_life", label: "Campus Life", icon: Heart },
  { id: "learning", label: "Learning", icon: BookOpen },
  { id: "projects", label: "Projects", icon: Briefcase },
];

const VIEW_MODES = [
  { id: "grid", label: "Grid", icon: LayoutGrid },
  { id: "timeline", label: "Timeline", icon: List },
];

const ACHIEVEMENT_ICONS = {
  study: Flame, assignments: BookOpen, exams: Award, learning: BookOpen,
  collaboration: Users, campus_life: Heart, milestone: Trophy,
  gpa: TrendingUp, streaks: Flame, course_completion: GraduationCap,
  degree_progress: Target, scholarships: ScrollText, certifications: BadgeCheck,
  leadership: Users, clubs: Users, community: Heart, volunteer: HandHeart,
  competitions: Medal, hackathon: Rocket, research: FlaskConical,
  events: CalendarDays, mentor: Star, creator: Video, podcast: Mic,
  projects: Briefcase,
};

export default function AchievementGallery() {
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();
  const [category, setCategory] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
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
          a.description?.toLowerCase().includes(q) ||
          a.verification_source?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [achievements, category, search]);

  const timelineGroups = useMemo(() => {
    if (viewMode !== "timeline") return [];
    const groups = {};
    filtered.forEach((a) => {
      const date = a.date_earned ? new Date(a.date_earned).toLocaleDateString("en", { month: "long", year: "numeric" }) : "Recent";
      if (!groups[date]) groups[date] = [];
      groups[date].push(a);
    });
    return Object.entries(groups);
  }, [filtered, viewMode]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts = {};
    (achievements || []).forEach((a) => {
      counts[a.category] = (counts[a.category] || 0) + 1;
    });
    return counts;
  }, [achievements]);

  const visibleCategories = CATEGORIES.filter((c) => c.id === "all" || categoryCounts[c.id]);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 px-4 pt-3 pb-2 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-card flex items-center justify-center active:scale-90 transition-transform" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <ArrowLeft className="w-4 h-4 text-foreground" strokeWidth={2.2} />
          </button>
          <div className="flex-1">
            <h1 className="text-[18px] font-bold text-foreground tracking-tight">Achievement Board</h1>
            <p className="text-[11px] text-muted-foreground">{filtered.length} verified {filtered.length === 1 ? "achievement" : "achievements"}</p>
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
            placeholder="Search achievements, certificates, sources..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-full bg-card text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}
          />
        </div>

        {/* Category filters */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {visibleCategories.map((c) => {
            const Icon = c.icon;
            const count = c.id === "all" ? (achievements || []).length : (categoryCounts[c.id] || 0);
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
                {count > 0 && <span className={`text-[9px] ${category === c.id ? "opacity-80" : "opacity-50"}`}>{count}</span>}
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
            <div className="w-16 h-16 rounded-[20px] glass-card flex items-center justify-center mb-5 crystal-bloom">
              <Award className="w-7 h-7 text-muted-foreground" strokeWidth={1.6} />
            </div>
            <h3 className="text-[16px] font-bold text-foreground mb-1.5">No achievements yet</h3>
            <p className="text-[12px] text-muted-foreground leading-relaxed max-w-[280px]">
              {search || category !== "all"
                ? "No achievements match your filters. Try adjusting them."
                : "Achievements you earn through study, exams, leadership, and campus participation will appear here. Keep going!"}
            </p>
          </div>
        ) : (
          <>
            {/* Bud milestone summary */}
            <div className="mb-4">
              <BudMilestoneSummary achievements={filtered} />
            </div>

            {/* Grid or Timeline */}
            {viewMode === "grid" ? (
              <div className="grid grid-cols-2 gap-3">
                {filtered.map((a, i) => (
                  <AchievementCard key={a.id} achievement={a} index={i} onClick={() => setSelectedItem(a)} onShare={() => setShareItem(a)} />
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
                        <AchievementRow key={a.id} achievement={a} index={i} onClick={() => setSelectedItem(a)} onShare={() => setShareItem(a)} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail sheet */}
      <AnimatePresence>
        {selectedItem && (
          <AchievementDetailSheet achievement={selectedItem} onClose={() => setSelectedItem(null)} />
        )}
      </AnimatePresence>
      {/* Share sheet */}
      <AnimatePresence>
        {shareItem && (
          <AchievementShareSheet achievement={shareItem} onClose={() => setShareItem(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function AchievementCard({ achievement, index, onClick, onShare }) {
  const Icon = ACHIEVEMENT_ICONS[achievement.category] || Award;
  const dateStr = achievement.date_earned
    ? new Date(achievement.date_earned).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })
    : "";
  const progress = achievement.progress ?? 100;
  const isInProgress = progress < 100;

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.04, type: "spring", stiffness: 200, damping: 20 }}
      onClick={onClick}
      className="relative rounded-[20px] glass-card p-4 flex flex-col items-center text-center overflow-hidden spring-tap card-hover"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-chocolate/5 pointer-events-none" />

      <div className="absolute top-2 right-2 flex items-center gap-1">
        {isInProgress && (
          <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-warning/15 text-warning">
            {progress}%
          </span>
        )}
        {onShare && (
          <button onClick={(e) => { e.stopPropagation(); onShare(achievement); }} className="w-6 h-6 rounded-full bg-muted/30 flex items-center justify-center active:scale-90 transition-transform">
            <Share2 className="w-3 h-3 text-muted-foreground" strokeWidth={2} />
          </button>
        )}
      </div>
      {achievement.certificate_url && (
        <span className="absolute top-2 left-2">
          <BadgeCheck className="w-3.5 h-3.5 text-chocolate" strokeWidth={2.2} />
        </span>
      )}

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

      {achievement.verification_source && (
        <p className="text-[8px] text-muted-foreground/70 mt-0.5 truncate w-full">{achievement.verification_source}</p>
      )}

      {isInProgress && (
        <div className="w-full h-1 rounded-full bg-muted/40 overflow-hidden mt-2">
          <div className="h-full rounded-full bg-gradient-to-r from-primary to-chocolate" style={{ width: `${progress}%` }} />
        </div>
      )}
    </motion.button>
  );
}

function AchievementRow({ achievement, index, onClick, onShare }) {
  const Icon = ACHIEVEMENT_ICONS[achievement.category] || Award;
  const dateStr = achievement.date_earned
    ? new Date(achievement.date_earned).toLocaleDateString("en", { month: "short", day: "numeric" })
    : "";
  const progress = achievement.progress ?? 100;
  const isInProgress = progress < 100;

  return (
    <motion.button
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-[16px] glass-card spring-tap card-hover text-left"
    >
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-chocolate flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-white" strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-bold text-foreground truncate">{achievement.title}</p>
        {achievement.description && (
          <p className="text-[10px] text-muted-foreground truncate">{achievement.description}</p>
        )}
        <div className="flex items-center gap-1.5 mt-0.5">
          {dateStr && <span className="text-[9px] text-muted-foreground">{dateStr}</span>}
          {achievement.verification_source && (
            <span className="text-[8px] text-muted-foreground/60 truncate">· {achievement.verification_source}</span>
          )}
        </div>
        {isInProgress && (
          <div className="w-full h-0.5 rounded-full bg-muted/40 overflow-hidden mt-1">
            <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>
      {onShare && (
        <button onClick={(e) => { e.stopPropagation(); onShare(achievement); }} className="w-7 h-7 rounded-full flex items-center justify-center active:scale-90 transition-transform flex-shrink-0">
          <Share2 className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.6} />
        </button>
      )}
      {achievement.certificate_url && <BadgeCheck className="w-3.5 h-3.5 text-chocolate flex-shrink-0" strokeWidth={2.2} />}
    </motion.button>
  );
}