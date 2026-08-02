import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Search, Building2, Compass } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import CommunityCard from "@/components/campus/CommunityCard";
import { COMMUNITY_TYPES, getIcon } from "@/components/campus/campusConstants";
import CommunityShell from "@/components/community/CommunityShell";
import InterestSelection from "@/components/communities/InterestSelection";
import HubCard from "@/components/hubs/HubCard";
import { getHubsForInterests, getOtherHubs } from "@/data/hubRegistry";
import { useInterests } from "@/hooks/useInterests";

const FILTER_KEYS = ["all", ...Object.keys(COMMUNITY_TYPES).slice(0, 8)];

export default function Communities() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const { interests, loading: interestsLoading, hasInterests } = useInterests();
  const userHubs = getHubsForInterests(interests);
  const exploreHubs = getOtherHubs(interests);

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
  });

  const cq = useQuery({
    queryKey: ["communities", user?.university],
    queryFn: () => base44.entities.Community.filter(
      { university: user?.university || "" },
      "-members_count",
      50
    ),
    enabled: !!user,
  });

  const communities = cq.data || [];
  const isLoading = cq.isLoading;

  const filtered = useMemo(() => {
    return communities.filter((c) => {
      const matchesFilter = filter === "all" || c.type === filter;
      const matchesSearch = !search ||
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.description?.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [communities, filter, search]);

  // ── Interest selection gate ── first-time visitors pick interests before seeing communities
  if (!interestsLoading && !hasInterests) {
    return <InterestSelection onComplete={() => {}} />;
  }

  if (interestsLoading) {
    return (
      <CommunityShell title="Communities" icon={Building2} accent="262 83% 58%">
        <div className="space-y-2.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-card rounded-[20px] p-4 soft-shadow border border-border/40 flex items-center gap-3">
              <div className="w-12 h-12 rounded-[16px] shimmer" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-1/2 shimmer rounded-full" />
                <div className="h-2 w-1/3 shimmer rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </CommunityShell>
    );
  }

  return (
    <CommunityShell title="Communities" icon={Building2} accent="262 83% 58%">

      {/* ── Your Hubs ── specialized community workspaces based on interests */}
      {userHubs.length > 0 && (
        <div className="pb-5">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2.5 px-1">Your Hubs</p>
          <div className="grid grid-cols-2 gap-3">
            {userHubs.map((hub, i) => (
              <HubCard key={hub.id} hub={hub} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* ── Explore ── other hubs available on campus */}
      {exploreHubs.length > 0 && (
        <div className="pb-5">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2.5 px-1 flex items-center gap-1.5">
            <Compass className="w-3 h-3" /> Explore
          </p>
          <div className="grid grid-cols-2 gap-3">
            {exploreHubs.map((hub, i) => (
              <HubCard key={hub.id} hub={hub} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* ── Browse Communities ── */}
      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2.5 px-1">Browse Communities</p>

      {/* Search */}
      <div className="py-1">
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
            title="No communities yet"
            description={search ? "Try a different search term." : "When communities are created, I'll recommend the ones that match your interests."}
          />
        ) : (
          filtered.map((community, i) => (
            <CommunityCard key={community.id} community={community} user={user} index={i} />
          ))
        )}
      </div>
    </CommunityShell>
  );
}