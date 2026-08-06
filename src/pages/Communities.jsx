import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Search, Building2, Compass, Plus } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import CommunityCard from "@/components/campus/CommunityCard";
import { COMMUNITY_TYPES, getIcon } from "@/components/campus/campusConstants";
import CommunityShell from "@/components/community/CommunityShell";
import CreateCommunityModal from "@/components/community/CreateCommunityModal";
import InterestSelection from "@/components/communities/InterestSelection";
import HubCard from "@/components/hubs/HubCard";
import { getHubsForInterests, getOtherHubs } from "@/data/hubRegistry";
import { useInterests } from "@/hooks/useInterests";
import CategoryTabs from "@/components/discovery/CategoryTabs";
import { DISCOVERY_TABS, matchesCategory } from "@/data/contentCategories";

const FILTER_KEYS = ["all", ...Object.keys(COMMUNITY_TYPES).slice(0, 8)];

export default function Communities() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [activeCategory, setActiveCategory] = useState("foryou");
  const [createOpen, setCreateOpen] = useState(false);
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
      const matchesCat = activeCategory === "foryou" || matchesCategory(c, activeCategory);
      const matchesFilter = filter === "all" || c.type === filter;
      const matchesSearch = !search ||
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.description?.toLowerCase().includes(search.toLowerCase());
      return matchesCat && matchesFilter && matchesSearch;
    });
  }, [communities, filter, search, activeCategory]);

  const availableCategoryTabs = useMemo(() => {
    return DISCOVERY_TABS.filter((tab) => {
      if (tab.id === "foryou") return true;
      return communities.some((c) => matchesCategory(c, tab.id));
    });
  }, [communities]);

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
    <>
      <CommunityShell
        title="Communities"
        icon={Building2}
        accent="262 83% 58%"
        actions={
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-1.5 rounded-full border border-border/40 bg-card px-3 py-1.5 text-[12px] font-semibold text-foreground spring-tap"
          >
            <Plus className="h-3.5 w-3.5" />
            Create
          </button>
        }
      >

        <div className="pb-4">
          <CategoryTabs tabs={availableCategoryTabs} activeTab={activeCategory} onChange={setActiveCategory} />
        </div>

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

        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2.5 px-1">Browse Communities</p>

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

      <CreateCommunityModal open={createOpen} onClose={() => setCreateOpen(false)} user={user} />
    </>
  );
}
