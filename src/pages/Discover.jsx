import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  Search, Sparkles, GraduationCap, Briefcase, Award, FlaskConical, Users,
  ShoppingBag, Calendar, TrendingUp, Building2, MessageCircle, ArrowRight,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { fallbackIfEmpty } from "@/lib/mock/useMockFallback";
import { DISCOVER_MOCK } from "@/lib/social/discoverMock";
import { useDemoMode } from "@/lib/DemoModeContext";
import { useUnibudContext } from "@/lib/UnibudContext";
import ScreenShell from "@/components/layout/ScreenShell";

const EASE = [0.16, 1, 0.3, 1];

const CATEGORIES = [
  { id: "all", label: "All", icon: Sparkles },
  { id: "students", label: "Students", icon: Users, to: "/connect" },
  { id: "educators", label: "Educators", icon: GraduationCap, to: "/mentorship" },
  { id: "schools", label: "Schools", icon: Building2, to: "/discover" },
  { id: "scholarships", label: "Scholarships", icon: Award, to: "/scholarships" },
  { id: "internships", label: "Internships", icon: Briefcase, to: "/opportunities" },
  { id: "competitions", label: "Competitions", icon: TrendingUp, to: "/challenges" },
  { id: "events", label: "Events", icon: Calendar, to: "/events" },
  { id: "research", label: "Research", icon: FlaskConical, to: "/research" },
  { id: "communities", label: "Communities", icon: Users, to: "/communities" },
  { id: "marketplace", label: "Marketplace", icon: ShoppingBag, to: "/marketplace" },
  { id: "discussions", label: "Discussions", icon: MessageCircle, to: "/square" },
];

/**
 * Discover — the intelligent exploration center.
 *
 * Campus Explorer + Opportunity Feed + Intelligent Discovery.
 * Replaces the old Quad-first layout with a unified discovery experience
 * spanning students, educators, schools, scholarships, internships,
 * competitions, events, research, communities, businesses, marketplace
 * listings, and trending discussions.
 */
export default function Discover() {
  const navigate = useNavigate();
  const { isDemoMode } = useDemoMode();
  const ctx = useUnibudContext();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const enabled = !isDemoMode;
  const useData = (key, fn, mock) =>
    fallbackIfEmpty(useQuery({ queryKey: [key], queryFn: fn, enabled }).data, mock);

  const communities = useData("discoverCommunities", () => base44.entities.Community.list("-created_date", 8), DISCOVER_MOCK.communities);
  const events = useData("discoverEvents", () => base44.entities.CampusEvent.list("-created_date", 8), DISCOVER_MOCK.events);
  const opportunities = useData("discoverOpps", () => base44.entities.Opportunity.list("-created_date", 8), DISCOVER_MOCK.opportunities);
  const scholarships = useData("discoverScholarships", () => base44.entities.Scholarship.list("-created_date", 6), []);
  const listings = useData("discoverListings", () => base44.entities.MarketplaceListing.list("-created_date", 6), []);
  const quadPosts = useData("discoverQuad", () => base44.entities.QuadPost.list("-created_date", 6), DISCOVER_MOCK.quadPosts);

  const trendingDiscussions = (quadPosts || []).slice(0, 4);

  const sections = useMemo(() => {
    const q = query.toLowerCase();
    const filterFn = (item) => !q || JSON.stringify(item).toLowerCase().includes(q);

    const result = [];

    if (category === "all" || category === "scholarships") {
      const items = (scholarships || []).filter(filterFn);
      if (items.length) result.push({ id: "scholarships", title: "Scholarships", icon: Award, to: "/scholarships", items: items.slice(0, 4), type: "scholarship" });
    }
    if (category === "all" || category === "internships") {
      const items = (opportunities || []).filter(filterFn);
      if (items.length) result.push({ id: "opportunities", title: "Opportunities & Internships", icon: Briefcase, to: "/opportunities", items: items.slice(0, 4), type: "opportunity" });
    }
    if (category === "all" || category === "events") {
      const items = (events || []).filter(filterFn);
      if (items.length) result.push({ id: "events", title: "Events", icon: Calendar, to: "/events", items: items.slice(0, 4), type: "event" });
    }
    if (category === "all" || category === "communities") {
      const items = (communities || []).filter(filterFn);
      if (items.length) result.push({ id: "communities", title: "Communities", icon: Users, to: "/communities", items: items.slice(0, 4), type: "community" });
    }
    if (category === "all" || category === "marketplace") {
      const items = (listings || []).filter(filterFn);
      if (items.length) result.push({ id: "marketplace", title: "Marketplace", icon: ShoppingBag, to: "/marketplace", items: items.slice(0, 4), type: "listing" });
    }
    if (category === "all" || category === "discussions") {
      if (trendingDiscussions.length) result.push({ id: "discussions", title: "Trending Discussions", icon: MessageCircle, to: "/square", items: trendingDiscussions, type: "discussion" });
    }

    return result;
  }, [query, category, communities, events, opportunities, scholarships, listings, trendingDiscussions]);

  return (
    <ScreenShell title="Discover" subtitle="Explore students, schools, opportunities, and everything campus." sticky={false}>
      {/* Search */}
      <div className="relative mb-4 mt-4">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search students, opportunities, communities…"
          className="w-full pl-10 pr-4 py-3 rounded-[18px] glass text-[14px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/40 spring-tap transition-all duration-300"
        />
      </div>

      {/* Category chips */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-5 -mx-1 px-1">
        {CATEGORIES.map((c) => {
          const Icon = c.icon;
          const active = category === c.id;
          return (
            <button
              key={c.id}
              onClick={() => {
                setCategory(c.id);
                if (c.to && c.id !== "all" && c.id !== "schools") {
                  // Keep in-page for filter, but allow direct nav on double-tap feel
                }
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap spring-tap transition-all duration-300 ${
                active ? "bg-primary text-primary-foreground ice-glow" : "glass text-foreground/70 hover:text-foreground"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Quick links — category shortcuts */}
      {category === "all" && !query && (
        <section className="mb-6">
          <div className="flex items-center gap-1.5 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-[12px] font-semibold text-foreground">Explore</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.filter((c) => c.id !== "all" && c.to).map((c) => {
              const Icon = c.icon;
              return (
                <Link key={c.id} to={c.to} className="crystal-card hover-lift p-3 spring-tap edge-light">
                  <div className="w-8 h-8 rounded-lg bg-foreground/[0.08] flex items-center justify-center mb-2">
                    <Icon className="w-4 h-4 text-foreground" strokeWidth={2} />
                  </div>
                  <p className="text-[11px] font-semibold text-foreground leading-tight">{c.label}</p>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Sections */}
      <div className="space-y-6">
        {sections.length === 0 ? (
          <div className="crystal-card p-8 text-center">
            <Search className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-[13px] text-muted-foreground">No results for "{query}"</p>
            <p className="text-[11px] text-muted-foreground/60 mt-1">Try a different search or category.</p>
          </div>
        ) : (
          sections.map((section, i) => (
            <motion.section
              key={section.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.4, ease: EASE }}
            >
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <section.icon className="w-4 h-4 text-foreground" strokeWidth={2} />
                  <h2 className="text-[13px] font-semibold text-foreground">{section.title}</h2>
                </div>
                <Link to={section.to} className="text-[11px] font-semibold text-primary spring-tap flex items-center gap-0.5">
                  See all <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <DiscoverSection section={section} />
            </motion.section>
          ))
        )}
      </div>
    </ScreenShell>
  );
}

function DiscoverSection({ section }) {
  return (
    <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
      {section.items.map((item, i) => (
        <DiscoverCard key={item.id || i} item={item} type={section.type} to={section.to} />
      ))}
    </div>
  );
}

function DiscoverCard({ item, type, to }) {
  const title = item.title || item.name || item.headline || "Untitled";
  const subtitle = item.summary || item.description || item.category || item.type || "";

  return (
    <Link to={to} className="flex-shrink-0 w-[200px] crystal-card hover-lift p-3.5 spring-tap edge-light">
      <p className="text-[13px] font-semibold text-foreground leading-tight line-clamp-2">{title}</p>
      {subtitle && <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{subtitle}</p>}
      {item.price !== undefined && (
        <p className="text-[12px] font-bold text-foreground mt-2">₦{Number(item.price).toLocaleString()}</p>
      )}
      {item.deadline && (
        <p className="text-[10px] text-muted-foreground mt-2">Due {new Date(item.deadline).toLocaleDateString()}</p>
      )}
    </Link>
  );
}