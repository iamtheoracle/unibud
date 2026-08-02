import React, { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import {
  Search, Sparkles, Users, Calendar, Briefcase, Award,
  ShoppingBag, Building2, TrendingUp,
} from "lucide-react";
import ScreenShell from "@/components/layout/ScreenShell";
import DiscoverySection from "@/components/discovery/DiscoverySection";
import DiscoveryEmptyState from "@/components/discovery/DiscoveryEmptyState";
import { useInterests } from "@/hooks/useInterests";
import RecentSearches, { saveRecentSearch } from "@/components/discovery/RecentSearches";

const EASE = [0.16, 1, 0.3, 1];

const FILTERS = [
  { id: "all", label: "All", icon: Sparkles },
  { id: "communities", label: "Communities", icon: Users },
  { id: "clubs", label: "Clubs", icon: Building2 },
  { id: "events", label: "Events", icon: Calendar },
  { id: "opportunities", label: "Opportunities", icon: Briefcase },
  { id: "scholarships", label: "Scholarships", icon: Award },
  { id: "marketplace", label: "Marketplace", icon: ShoppingBag },
  { id: "people", label: "People", icon: Users },
];

const ACADEMIC_TYPES = ["course", "department", "faculty", "study_group", "research_group", "programme"];

/**
 * Discover — the Orbit Discovery Feed.
 *
 * Production-first: fetches real data from entities with zero mock
 * fallbacks. Shows beautiful empty states when no data exists.
 * Sections are built from real communities, events, clubs,
 * opportunities, scholarships, and marketplace listings.
 */
export default function Discover() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [searchFocused, setSearchFocused] = useState(false);
  const { interests } = useInterests();

  const { data: user } = useQuery({ queryKey: ["currentUser"], queryFn: () => base44.auth.me() });
  const uni = user?.university || "";

  // ── Real data queries — zero mock fallbacks ──
  const communitiesQ = useQuery({
    queryKey: ["discover-communities", uni],
    queryFn: () => base44.entities.Community.filter(uni ? { university: uni } : {}, "-members_count", 30),
  });
  const eventsQ = useQuery({
    queryKey: ["discover-events"],
    queryFn: () => base44.entities.CampusEvent.filter({ status: "upcoming" }, "date", 20),
  });
  const clubsQ = useQuery({
    queryKey: ["discover-clubs", uni],
    queryFn: () => base44.entities.Club.filter(uni ? { university: uni } : {}, "-members_count", 20),
  });
  const oppsQ = useQuery({
    queryKey: ["discover-opps"],
    queryFn: () => base44.entities.Opportunity.list("-created_date", 10),
  });
  const scholarshipsQ = useQuery({
    queryKey: ["discover-scholarships"],
    queryFn: () => base44.entities.Scholarship.list("-created_date", 10),
  });
  const listingsQ = useQuery({
    queryKey: ["discover-listings"],
    queryFn: () => base44.entities.MarketplaceListing.list("-created_date", 8),
  });

  // ── People search — uses smartUserSearch backend function ──
  const peopleQ = useQuery({
    queryKey: ["discover-people", query],
    queryFn: async () => {
      const res = await base44.functions.invoke("smartUserSearch", { query, limit: 10 });
      return res.data?.results || [];
    },
    enabled: query.trim().length >= 2,
  });

  const people = peopleQ.data || [];

  // ── Save recent searches (debounced) ──
  useEffect(() => {
    if (query.trim().length >= 3) {
      const timer = setTimeout(() => saveRecentSearch(query.trim()), 2000);
      return () => clearTimeout(timer);
    }
  }, [query]);

  const communities = communitiesQ.data || [];
  const events = eventsQ.data || [];
  const clubs = clubsQ.data || [];
  const opportunities = oppsQ.data || [];
  const scholarships = scholarshipsQ.data || [];
  const listings = listingsQ.data || [];
  const isLoading = communitiesQ.isLoading || eventsQ.isLoading;

  // ── Search filter ──
  const q = query.toLowerCase();
  const filterFn = (item) => !q || JSON.stringify(item).toLowerCase().includes(q);

  // ── "For You" — communities matching user interests ──
  const interestTags = (interests || []).map((i) => (typeof i === "string" ? i : i?.id || i?.label || "").toLowerCase());
  const forYou = interestTags.length > 0
    ? communities.filter((c) => {
        const tags = (c.tags || []).map((t) => t.toLowerCase());
        return tags.some((t) => interestTags.includes(t)) || interestTags.includes(c.type?.toLowerCase());
      })
    : [];

  // ── "Trending" — communities with most real members ──
  const trending = [...communities]
    .sort((a, b) => (b.members_count || 0) - (a.members_count || 0))
    .slice(0, 8);

  // ── "Academics" — academic-type communities ──
  const academic = communities.filter((c) => ACADEMIC_TYPES.includes(c.type));

  // ── Build sections ──
  const sections = useMemo(() => {
    const result = [];
    const showAll = filter === "all";

    if (showAll && forYou.length > 0) {
      result.push({ id: "foryou", title: "For You", icon: Sparkles, to: "/communities", items: forYou.slice(0, 8).filter(filterFn), type: "community" });
    }
    if (showAll && academic.length > 0) {
      result.push({ id: "academic", title: "Academic Communities", icon: Briefcase, to: "/communities", items: academic.slice(0, 8).filter(filterFn), type: "community" });
    }
    if ((showAll || filter === "communities") && trending.length > 0) {
      result.push({ id: "trending", title: "Trending Communities", icon: TrendingUp, to: "/communities", items: trending.filter(filterFn), type: "community" });
    }
    if ((showAll || filter === "clubs") && clubs.length > 0) {
      result.push({ id: "clubs", title: "Clubs & Societies", icon: Building2, to: "/clubs", items: clubs.filter(filterFn), type: "club" });
    }
    if ((showAll || filter === "events") && events.length > 0) {
      result.push({ id: "events", title: "Upcoming Events", icon: Calendar, to: "/events", items: events.filter(filterFn), type: "event" });
    }
    if (showAll || filter === "opportunities") {
      const oppItems = opportunities.filter(filterFn);
      if (oppItems.length > 0) {
        result.push({ id: "opportunities", title: "Opportunities", icon: Briefcase, to: "/opportunities", items: oppItems, type: "opportunity" });
      }
    }
    if ((showAll || filter === "scholarships") && scholarships.length > 0) {
      result.push({ id: "scholarships", title: "Scholarships", icon: Award, to: "/scholarships", items: scholarships.filter(filterFn), type: "scholarship" });
    }
    if ((showAll || filter === "marketplace") && listings.length > 0) {
      result.push({ id: "marketplace", title: "Marketplace", icon: ShoppingBag, to: "/marketplace", items: listings.filter(filterFn), type: "listing" });
    }
    if ((showAll || filter === "people") && people.length > 0) {
      result.push({ id: "people", title: "People", icon: Users, to: "/connect", items: people, type: "people" });
    }

    return result.filter((s) => s.items.length > 0);
  }, [filter, query, forYou, academic, trending, clubs, events, opportunities, scholarships, listings, people]);

  return (
    <ScreenShell title="Discover" subtitle="Explore communities, events, opportunities, and everything campus." sticky={false}>
      {/* Search */}
      <div className="relative mb-4 mt-4">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
          placeholder="Search communities, events, people…"
          className="w-full pl-10 pr-4 py-3 rounded-[18px] glass text-[14px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/40 spring-tap transition-all duration-300"
        />
      </div>

      {/* Recent searches — shown when focused and no query */}
      {searchFocused && !query && (
        <RecentSearches onSelect={(term) => setQuery(term)} />
      )}

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-5 -mx-1 px-1">
        {FILTERS.map((f) => {
          const Icon = f.icon;
          const active = filter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap spring-tap transition-all duration-300 ${
                active ? "bg-foreground text-background" : "glass text-foreground/70"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {isLoading ? (
        <DiscoverySkeleton />
      ) : sections.length === 0 ? (
        <DiscoveryEmptyState query={query} />
      ) : (
        <div className="space-y-6">
          {sections.map((section, i) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.4, ease: EASE }}
            >
              <DiscoverySection {...section} />
            </motion.div>
          ))}
        </div>
      )}
    </ScreenShell>
  );
}

function DiscoverySkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 3 }).map((_, s) => (
        <div key={s}>
          <div className="h-4 w-32 shimmer rounded-full mb-3" />
          <div className="flex gap-3 overflow-hidden">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[200px] crystal-card p-3.5">
                <div className="w-full h-24 rounded-[12px] shimmer mb-2.5" />
                <div className="h-3 w-3/4 shimmer rounded-full mb-2" />
                <div className="h-2 w-1/2 shimmer rounded-full" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}