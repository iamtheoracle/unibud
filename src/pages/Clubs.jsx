import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useMockFallback } from "@/lib/mock/useMockFallback";
import { ArrowLeft, Search, Users, BadgeCheck } from "lucide-react";
import { useDemoMode } from "@/lib/DemoModeContext";
import EmptyState from "@/components/ui/EmptyState";
import ClubCard from "@/components/campus/ClubCard";
import { CLUB_CATEGORIES } from "@/components/campus/campusConstants";
import CommunityShell from "@/components/community/CommunityShell";

const DEMO_CLUBS = [
  {
    id: "dcl1", name: "UNIBUD Developers", category: "programming",
    description: "Weekly coding sessions, hackathons, and tech talks. All skill levels welcome!",
    members_count: 340, is_verified: true, is_recruiting: true,
    president: "Tunde Bakare", accent_color: "262 83% 58%",
    meeting_schedule: "Fridays 4PM, Lab 3",
    banner_url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&q=80",
  },
  {
    id: "dcl2", name: "Robotics Society", category: "robotics",
    description: "Building autonomous robots and competing in national robotics competitions.",
    members_count: 85, is_verified: true, is_recruiting: true,
    president: "Aisha Mohammed", accent_color: "217 91% 60%",
    meeting_schedule: "Saturdays 10AM, Engineering Workshop",
  },
  {
    id: "dcl3", name: "Lens & Light Photography", category: "photography",
    description: "Capturing campus life. Monthly photo walks and exhibitions.",
    members_count: 120, is_verified: true, is_recruiting: true,
    president: "Grace Adebayo", accent_color: "142 71% 45%",
    meeting_schedule: "Sundays 2PM",
    banner_url: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=600&q=80",
  },
  {
    id: "dcl4", name: "Entrepreneurship Hub", category: "entrepreneurship",
    description: "From idea to startup. Pitch sessions, mentorship, and funding guidance.",
    members_count: 200, is_verified: true, is_recruiting: true,
    president: "Chidi Okafor", accent_color: "38 92% 50%",
    meeting_schedule: "Wednesdays 5PM, Business School",
  },
  {
    id: "dcl5", name: "Campus Debate Union", category: "debate",
    description: "Sharpen your argumentation skills. Inter-university competitions and workshops.",
    members_count: 75, is_verified: true, is_recruiting: false,
    president: "Emeka Nwosu", accent_color: "0 72% 51%",
    meeting_schedule: "Tuesdays 4PM, LT 2",
  },
  {
    id: "dcl6", name: "Innovation Lab", category: "innovation",
    description: "Where ideas become reality. Prototyping, 3D printing, and design thinking.",
    members_count: 150, is_verified: true, is_recruiting: true,
    president: "Daniel Okonkwo", accent_color: "262 83% 58%",
    meeting_schedule: "Mondays 3PM, Innovation Centre",
    banner_url: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&q=80",
  },
  {
    id: "dcl7", name: "Music Society", category: "music",
    description: "From classical to afrobeats. Band practice, performances, and music theory.",
    members_count: 90, is_verified: true, is_recruiting: true,
    president: "Zainab Yusuf", accent_color: "262 83% 58%",
    meeting_schedule: "Thursdays 5PM, Music Room",
  },
  {
    id: "dcl8", name: "Volunteer Corps", category: "volunteer",
    description: "Community service, outreach programs, and social impact projects.",
    members_count: 180, is_verified: true, is_recruiting: true,
    president: "Mary Eze", accent_color: "142 71% 45%",
    meeting_schedule: "Bi-weekly Saturdays",
  },
];

export default function Clubs() {
  const navigate = useNavigate();
  const { isDemoMode } = useDemoMode();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
    enabled: !isDemoMode,
  });

  const cq = useQuery({
    queryKey: ["clubs", user?.university],
    queryFn: () => base44.entities.Club.filter(
      { university: user?.university || "" },
      "-members_count",
      50
    ),
    enabled: !isDemoMode && !!user,
  });
  const { data: mockClubs } = useMockFallback(cq, DEMO_CLUBS);
  const isLoading = cq.isLoading;
  const displayClubs = isDemoMode ? DEMO_CLUBS : mockClubs;
  const activeUser = isDemoMode ? { id: "demo", full_name: "Demo User" } : user;

  const filtered = useMemo(() => {
    return displayClubs.filter((club) => {
      const matchesFilter = filter === "all" || club.category === filter;
      const matchesVerified = !verifiedOnly || club.is_verified;
      const matchesSearch = !search ||
        club.name?.toLowerCase().includes(search.toLowerCase()) ||
        club.description?.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesVerified && matchesSearch;
    });
  }, [displayClubs, filter, verifiedOnly, search]);

  const FILTER_KEYS = ["all", ...Object.keys(CLUB_CATEGORIES)];

  return (
    <CommunityShell title="Clubs" icon={Users} accent="38 92% 50%">

      {/* Search */}
      <div className="py-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clubs..."
            className="w-full pl-10 pr-4 py-3 rounded-[16px] bg-card border border-border/40 text-[13px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 soft-shadow"
          />
        </div>
      </div>

      {/* Verified Filter */}
      <div className="mb-3">
        <button
          onClick={() => setVerifiedOnly(!verifiedOnly)}
          className={
            "w-full py-2.5 rounded-[14px] text-[12px] font-semibold transition-all spring-tap flex items-center justify-center gap-2 " +
            (verifiedOnly
              ? "bg-primary/10 text-primary border border-primary/30"
              : "bg-card text-muted-foreground border border-border/40")
          }
        >
          <BadgeCheck className="w-4 h-4" />
          {verifiedOnly ? "Showing Verified Clubs Only" : "Show Verified Only"}
        </button>
      </div>

      {/* Category Filter */}
      <div className="pb-3 overflow-x-auto no-scrollbar">
        <div className="flex gap-2">
          {FILTER_KEYS.map((key) => {
            const meta = key === "all" ? { label: "All" } : CLUB_CATEGORIES[key];
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={
                  "px-3.5 py-2 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all spring-tap " +
                  (filter === key
                    ? "bg-foreground text-background soft-shadow"
                    : "bg-card text-muted-foreground border border-border/40")
                }
              >
                {meta.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Clubs Grid */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-card rounded-[20px] soft-shadow overflow-hidden">
              <div className="h-16 shimmer" />
              <div className="p-3 space-y-2">
                <div className="h-3 w-2/3 shimmer rounded-full" />
                <div className="h-2 w-1/2 shimmer rounded-full" />
                <div className="h-7 shimmer rounded-full" />
              </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="col-span-full">
            <EmptyState
              icon={Users}
              title="No clubs found"
              description={search ? "Try a different search." : "Clubs will appear here as they're registered."}
            />
          </div>
        ) : (
          filtered.map((club, i) => (
            <ClubCard key={club.id} club={club} user={activeUser} index={i} />
          ))
        )}
      </div>
    </CommunityShell>
  );
}