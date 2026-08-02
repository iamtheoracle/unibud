import React, { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import {
  Search, Users, TrendingUp, Sparkles, Clock, Plus, X,
  ChevronRight, BookOpen, Lock, Globe,
} from "lucide-react";

const EASE = [0.16, 1, 0.3, 1];

const FILTERS = [
  { id: "recommended", label: "Recommended", icon: Sparkles },
  { id: "trending", label: "Trending", icon: TrendingUp },
  { id: "new", label: "New", icon: Plus },
  { id: "active", label: "Active", icon: Clock },
];

export default function StudyGroupDirectory() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("recommended");

  const { data: user } = useQuery({ queryKey: ["currentUser"], queryFn: () => base44.auth.me() });

  const { data: groups, isLoading } = useQuery({
    queryKey: ["studyGroupDirectory"],
    queryFn: () => base44.entities.StudyGroup.list("-created_date", 100),
  });

  const processed = useMemo(() => {
    let list = [...(groups || [])];

    if (search) {
      const q = search.toLowerCase();
      list = list.filter((g) =>
        g.name?.toLowerCase().includes(q) ||
        g.description?.toLowerCase().includes(q) ||
        g.course_code?.toLowerCase().includes(q) ||
        g.subject?.toLowerCase().includes(q) ||
        g.department?.toLowerCase().includes(q) ||
        g.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    switch (filter) {
      case "trending":
        list.sort((a, b) => (b.members_count || 0) - (a.members_count || 0));
        break;
      case "new":
        list.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
        break;
      case "active":
        list.sort((a, b) => new Date(b.updated_date || b.created_date) - new Date(a.updated_date || a.created_date));
        break;
      case "recommended":
      default:
        list.sort((a, b) => {
          let aScore = 0, bScore = 0;
          if (a.course_code && user?.data?.courses?.includes(a.course_code)) aScore += 10;
          if (b.course_code && user?.data?.courses?.includes(b.course_code)) bScore += 10;
          if (a.department && user?.data?.department === a.department) aScore += 5;
          if (b.department && user?.data?.department === b.department) bScore += 5;
          if (a.faculty && user?.data?.faculty === a.faculty) aScore += 3;
          if (b.faculty && user?.data?.faculty === b.faculty) bScore += 3;
          aScore += (a.members_count || 0) * 0.1;
          bScore += (b.members_count || 0) * 0.1;
          return bScore - aScore;
        });
        break;
    }

    return list;
  }, [groups, search, filter, user]);

  const handleJoin = async (group) => {
    try {
      await base44.entities.StudyGroup.update(group.id, {
        is_joined: true,
        members_count: (group.members_count || 0) + 1,
      });
      qc.invalidateQueries({ queryKey: ["studyGroupDirectory"] });
      qc.invalidateQueries({ queryKey: ["studyGroups"] });
    } catch {}
  };

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-[14px] glass-card">
        <Search className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.8} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search study groups by name, course, department..."
          className="flex-1 bg-transparent text-[12px] text-foreground outline-none"
        />
        {search && <button onClick={() => setSearch("")}><X className="w-3.5 h-3.5 text-muted-foreground" /></button>}
      </div>

      {/* Filter chips */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
        {FILTERS.map((f) => {
          const Icon = f.icon;
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-medium spring-tap shrink-0 ${filter === f.id ? "bg-primary text-primary-foreground" : "glass-card text-muted-foreground"}`}
            >
              <Icon className="w-3 h-3" /> {f.label}
            </button>
          );
        })}
      </div>

      {/* Groups list */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-[14px] bg-muted/40 animate-pulse" />)}
        </div>
      ) : processed.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-14 h-14 rounded-[18px] glass-card flex items-center justify-center mb-3">
            <Users className="w-6 h-6 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <p className="text-[13px] font-semibold text-foreground mb-1">{search ? "No results" : "No study groups yet"}</p>
          <p className="text-[11px] text-muted-foreground max-w-[240px]">{search ? "Try a different search term" : "Study groups will appear here when students create them."}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {processed.map((group, i) => (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3, ease: EASE }}
              className="glass-card p-3.5 spring-tap card-hover"
              onClick={() => navigate(`/study-groups/${group.id}`)}
            >
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-[14px] bg-gradient-to-br from-primary/20 to-chocolate/20 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-5 h-5 text-primary" strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-[13px] font-bold text-foreground truncate">{group.name}</p>
                    {group.type === "private" ? <Lock className="w-3 h-3 text-muted-foreground" /> : <Globe className="w-3 h-3 text-muted-foreground" />}
                  </div>
                  {group.description && <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">{group.description}</p>}
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {group.course_code && <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] font-semibold">{group.course_code}</span>}
                    {group.department && <span className="px-1.5 py-0.5 rounded-full bg-muted/50 text-muted-foreground text-[9px] font-semibold">{group.department}</span>}
                    <span className="flex items-center gap-0.5 text-[9px] text-muted-foreground"><Users className="w-2.5 h-2.5" /> {group.members_count || 0}</span>
                  </div>
                </div>
                {!group.is_joined ? (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleJoin(group); }}
                    className="px-3 py-1.5 rounded-[10px] bg-primary/10 text-primary text-[10px] font-bold spring-tap flex-shrink-0"
                  >
                    Join
                  </button>
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-3" />
                )}
              </div>
              {group.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {group.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="px-1.5 py-0.5 rounded-full bg-muted/30 text-[8px] font-medium text-muted-foreground">#{tag}</span>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}