import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useMockFallback } from "@/lib/mock/useMockFallback";
import { ArrowLeft, Search, Building2 } from "lucide-react";
import { useDemoMode } from "@/lib/DemoModeContext";
import EmptyState from "@/components/ui/EmptyState";
import CommunityCard from "@/components/campus/CommunityCard";
import { COMMUNITY_TYPES, getIcon } from "@/components/campus/campusConstants";
import ScreenShell from "@/components/layout/ScreenShell";

const DEMO_COMMUNITIES = [
  { id: "dc1", name: "University of Benin", type: "university", description: "The official UNIBUD community for all students.", members_count: 12450, is_verified: true, is_official: true, accent_color: "262 83% 58%" },
  { id: "dc2", name: "Faculty of Engineering", type: "faculty", description: "All engineering departments and students.", members_count: 3200, is_verified: true, is_official: true, accent_color: "262 83% 58%" },
  { id: "dc3", name: "Department of Computer Science", type: "department", description: "CSC students, lecturers, and resources.", members_count: 850, is_verified: true, is_official: true, accent_color: "142 71% 45%" },
  { id: "dc4", name: "200 Level Computer Science", type: "level", description: "200L CSC students — your class community.", members_count: 210, is_verified: true, is_official: true, accent_color: "0 72% 51%" },
  { id: "dc5", name: "CSC 301 — Data Structures", type: "course", course_code: "CSC 301", description: "Course space for lectures, notes, and discussions.", members_count: 180, is_verified: true, is_official: true, accent_color: "217 91% 60%" },
  { id: "dc6", name: "UNIBUD Programming Club", type: "club", description: "Weekly coding sessions, hackathons, and tech talks.", members_count: 340, is_verified: true, accent_color: "38 92% 50%" },
  { id: "dc7", name: "AI Research Group", type: "research_group", description: "Exploring machine learning and AI applications.", members_count: 45, accent_color: "142 71% 45%" },
  { id: "dc8", name: "Student Union Government", type: "sug", description: "The official student government body.", members_count: 120, is_verified: true, is_official: true, accent_color: "262 83% 58%" },
  { id: "dc9", name: "Hall 3 Hostel", type: "hostel", description: "Residents of Hall 3 — announcements and updates.", members_count: 280, accent_color: "262 83% 58%" },
  { id: "dc10", name: "Photography Enthusiasts", type: "interest_group", description: "Capturing moments on and off campus.", members_count: 95, accent_color: "142 71% 45%" },
];

const FILTER_KEYS = ["all", ...Object.keys(COMMUNITY_TYPES).slice(0, 8)];

export default function Communities() {
  const navigate = useNavigate();
  const { isDemoMode } = useDemoMode();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
    enabled: !isDemoMode,
  });

  const cq = useQuery({
    queryKey: ["communities", user?.university],
    queryFn: () => base44.entities.Community.filter(
      { university: user?.university || "" },
      "-members_count",
      50
    ),
    enabled: !isDemoMode && !!user,
  });
  const { data: mockCommunities } = useMockFallback(cq, DEMO_COMMUNITIES);
  const isLoading = cq.isLoading;
  const displayCommunities = isDemoMode ? DEMO_COMMUNITIES : mockCommunities;
  const activeUser = isDemoMode ? { id: "demo", full_name: "Demo User" } : user;

  const filtered = useMemo(() => {
    return displayCommunities.filter((c) => {
      const matchesFilter = filter === "all" || c.type === filter;
      const matchesSearch = !search ||
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.description?.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [displayCommunities, filter, search]);

  return (
    <ScreenShell back title="Communities" subtitle={isDemoMode ? "Your Campus" : (user?.university || "Your Campus")}>

      {/* Search */}
      <div className="py-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search communities..."
            className="w-full pl-10 pr-4 py-3 rounded-[16px] bg-card border border-border/40 text-[13px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 soft-shadow"
          />
        </div>
      </div>

      {/* Filter Chips */}
      <div className="pb-3 overflow-x-auto no-scrollbar">
        <div className="flex gap-2">
          {FILTER_KEYS.map((key) => {
            const meta = key === "all" ? { label: "All" } : COMMUNITY_TYPES[key];
            const Icon = key === "all" ? null : getIcon(meta.icon);
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={
                  "px-3.5 py-2 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all spring-tap flex items-center gap-1.5 " +
                  (filter === key
                    ? "bg-foreground text-background soft-shadow"
                    : "bg-card text-muted-foreground border border-border/40")
                }
              >
                {Icon && <Icon className="w-3 h-3" />}
                {meta.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* List */}
      <div className="space-y-2.5">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-card rounded-[20px] p-4 soft-shadow border border-border/40 flex items-center gap-3">
              <div className="w-12 h-12 rounded-[16px] shimmer" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-1/2 shimmer rounded-full" />
                <div className="h-2 w-1/3 shimmer rounded-full" />
              </div>
              <div className="w-16 h-8 shimmer rounded-full" />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No communities found"
            description={search ? "Try a different search term." : "Communities will appear here as they're created."}
          />
        ) : (
          filtered.map((community, i) => (
            <CommunityCard key={community.id} community={community} user={activeUser} index={i} />
          ))
        )}
      </div>
    </ScreenShell>
  );
}