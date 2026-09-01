import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Search, Sparkles, Users } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useDemoMode } from "@/lib/DemoModeContext";
import { useFollowing } from "@/hooks/useFollowing";
import FollowingFeed from "@/components/quad/FollowingFeed";
import DiscoverySearch from "@/components/discovery/DiscoverySearch";
import TrendingTopics from "@/components/discovery/TrendingTopics";
import PeopleToFollow from "@/components/discovery/PeopleToFollow";
import PopularDiscussions from "@/components/discovery/PopularDiscussions";
import DiscoveryCampus from "@/components/discovery/DiscoveryCampus";
import DiscoveryCommunities from "@/components/discovery/DiscoveryCommunities";
import DiscoveryEvents from "@/components/discovery/DiscoveryEvents";
import DiscoveryMedia from "@/components/discovery/DiscoveryMedia";
import DiscoveryUpdates from "@/components/discovery/DiscoveryUpdates";

// Discovery — the exploration layer of UNIBUD.
// Every section renders only when real data exists; nothing is fabricated.
export default function Discover() {
  const { isDemoMode } = useDemoMode();
  const [rawQuery, setRawQuery] = useState("");
  const [query, setQuery] = useState("");

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
    enabled: !isDemoMode,
  });
  const { followingIds } = useFollowing();

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setQuery(rawQuery.trim()), 350);
    return () => clearTimeout(t);
  }, [rawQuery]);

  const searching = query.length >= 2;

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="pt-12 px-5 pb-3">
        <h1 className="font-heading font-extrabold text-[24px] tracking-tight text-foreground">Discover</h1>
        <p className="text-[12px] text-muted-foreground">
          {user?.university || "Your Campus"} · What's happening
        </p>
      </div>

      {/* Search */}
      <div className="px-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={rawQuery}
            onChange={(e) => setRawQuery(e.target.value)}
            placeholder="Search UNIBUD"
            className="w-full pl-10 pr-4 h-11 rounded-2xl bg-card border border-border/40 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      {searching ? (
        <DiscoverySearch query={query} user={user} onPickTag={(t) => setRawQuery(t)} />
      ) : (
        <>
          {/* For You */}
          {followingIds.size > 0 ? (
            <section className="mb-6">
              <div className="flex items-center gap-2 px-5 mb-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <h2 className="font-heading font-bold text-[15px] text-foreground">For you</h2>
              </div>
              <FollowingFeed user={user} followingIds={followingIds} />
            </section>
          ) : (
            <section className="px-4 mb-6">
              <div className="rounded-2xl bg-card border border-border/30 p-5 text-center">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-heading font-bold text-[14px] text-foreground">Build your Discovery</h3>
                <p className="text-[12px] text-muted-foreground leading-relaxed mt-1 max-w-[260px] mx-auto">
                  Follow students, educators and creators, and join communities to personalize what you see here.
                </p>
                <Link
                  to="/communities"
                  className="inline-flex items-center gap-1.5 mt-3 px-4 h-9 rounded-full bg-foreground text-background text-[12px] font-semibold spring-tap"
                >
                  <Users className="w-4 h-4" /> Join communities
                </Link>
              </div>
            </section>
          )}

          <TrendingTopics onPickTag={(t) => setRawQuery(t)} />
          <PeopleToFollow user={user} />
          <PopularDiscussions user={user} />
          <DiscoveryCampus user={user} />
          <DiscoveryCommunities user={user} />
          <DiscoveryEvents user={user} />
          <DiscoveryMedia user={user} />
          <DiscoveryUpdates />
        </>
      )}
    </div>
  );
}