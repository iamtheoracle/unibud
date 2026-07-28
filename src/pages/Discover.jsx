import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { ArrowLeft } from "lucide-react";
import { fallbackIfEmpty } from "@/lib/mock/useMockFallback";
import { DISCOVER_MOCK } from "@/lib/social/discoverMock";
import { useDemoMode } from "@/lib/DemoModeContext";
import { useDiscoveryRanking } from "@/hooks/useDiscoveryRanking";
import { CATEGORIES } from "@/components/discover/discoverCategories";
import ForYouSection from "@/components/discover/sections/ForYouSection";
import CampusSection from "@/components/discover/sections/CampusSection";
import TopicSection from "@/components/discover/sections/TopicSection";
import CareersSection from "@/components/discover/sections/CareersSection";
import SocialSection from "@/components/discover/sections/SocialSection";
import TrendingSection from "@/components/discover/sections/TrendingSection";
import ScreenShell from "@/components/layout/ScreenShell";

const TOPIC_KEYS = ["sports", "entertainment", "technology"];

/**
 * Discover — intelligent discovery engine. A fixed set of categories, each
 * with its own dedicated experience. Spark adaptively ranks which category
 * appears first based on engagement, while keeping the structure familiar.
 */
export default function Discover() {
  const { isDemoMode } = useDemoMode();
  const navigate = useNavigate();
  const baseKeys = CATEGORIES.map((c) => c.key);
  const { ranked, recordView } = useDiscoveryRanking(baseKeys);
  const rankedCats = ranked.map((k) => CATEGORIES.find((c) => c.key === k));
  const [active, setActive] = useState("foryou");

  useEffect(() => { recordView(active); }, [active, recordView]);

  const enabled = !isDemoMode;
  const useData = (key, fn, mock) => fallbackIfEmpty(
    useQuery({ queryKey: [key], queryFn: fn, enabled }).data,
    mock
  );
  const data = {
    quadPosts: useData("discoverQuad", () => base44.entities.QuadPost.list("-created_date", 12), DISCOVER_MOCK.quadPosts),
    events: useData("discoverEvents", () => base44.entities.CampusEvent.list("-created_date", 8), DISCOVER_MOCK.events),
    clubs: useData("discoverClubs", () => base44.entities.Club.list("-created_date", 8), DISCOVER_MOCK.clubs),
    communities: useData("discoverCommunities", () => base44.entities.Community.list("-created_date", 8), DISCOVER_MOCK.communities),
    opportunities: useData("discoverOpps", () => base44.entities.Opportunity.list("-created_date", 8), DISCOVER_MOCK.opportunities),
    scholarships: useData("discoverSchol", () => base44.entities.Scholarship.list("-created_date", 8), DISCOVER_MOCK.scholarships),
    listings: useData("discoverListings", () => base44.entities.MarketplaceListing.filter({ status: "active" }), DISCOVER_MOCK.listings),
    lostFound: useData("discoverLost", () => base44.entities.LostFoundItem.list("-created_date", 6), DISCOVER_MOCK.lostFound),
    challenges: useData("discoverChallenges", () => base44.entities.Challenge.list("-created_date", 6), DISCOVER_MOCK.challenges),
  };

  const activeCat = CATEGORIES.find((c) => c.key === active);

  const renderSection = () => {
    if (active === "foryou") return <ForYouSection data={data} />;
    if (active === "campus") return <CampusSection data={data} />;
    if (TOPIC_KEYS.includes(active)) return <TopicSection category={activeCat} />;
    if (active === "careers") return <CareersSection data={data} />;
    if (active === "social") return <SocialSection data={data} />;
    return <TrendingSection data={data} />;
  };

  return (
    <ScreenShell back title="Discover" subtitle="What should I discover today?" sticky={false}>

      {/* Adaptive category rail */}
      <div className="sticky top-0 z-20 -mx-5 px-5 py-3 glass border-b border-border/20">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {rankedCats.map((c) => {
            const Icon = c.icon;
            const on = active === c.key;
            return (
              <button
                key={c.key}
                onClick={() => setActive(c.key)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12px] font-semibold whitespace-nowrap spring-tap ${
                  on ? "bg-primary text-primary-foreground soft-shadow" : "bg-card text-foreground/80 border border-border/40"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />{c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active section */}
      <div className="pt-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {renderSection()}
          </motion.div>
        </AnimatePresence>
      </div>
    </ScreenShell>
  );
}